-- variables
local config = require 'config'

-- functions --
local function Draw3DText(x, y, z, text)
	local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    local px,py,pz=table.unpack(GetGameplayCamCoords())
    local dist = #(vec3(px,py,pz) - vec3(x,y,z))

    local scale = (1/dist)*2
    local fov = (1/GetGameplayCamFov())*100
    
	if onScreen then
		SetTextScale(0.4, 0.4)
		SetTextFont(4)
		SetTextProportional(1)
		SetTextColour(255, 255, 255, 215)
		SetTextDropShadow(0, 0, 0, 55)
		SetTextEdge(0, 0, 0, 150)
		SetTextDropShadow()
		SetTextOutline()
		SetTextCentre(1)
        SetTextEntry("STRING")
		AddTextComponentString(text)
		DrawText(_x,_y)
	end
end

local function Teleport(pos)
    local x, y, z = pos.x, pos.y, pos.z

    RequestCollisionAtCoord(x, y, z)
    NewLoadSceneStart(x, y, z, x, y, z, 50.0, 0)

    local sceneLoadTimer = GetGameTimer()
    while not IsNewLoadSceneLoaded() do
        if GetGameTimer() - sceneLoadTimer > 2000 then break end
        Wait(0)
    end

    SetEntityCoords(cache.ped, x, y, z)
    sceneLoadTimer = GetGameTimer()

    while not HasCollisionLoadedAroundEntity(cache.ped) do
        if GetGameTimer() - sceneLoadTimer > 2000 then break end
        Wait(0)
    end

    local foundNewZ, newZ = GetGroundZFor_3dCoord(x, y, z, 0, 0)
    if foundNewZ and newZ > 0 then z = newZ end

    SetEntityCoords(cache.ped, x, y, z)
    NewLoadSceneStop()

    NetworkFadeInEntity(cache.ped, 1)
    DoScreenFadeIn(3000)
end

-- main functions --
local function OpenUI(current, floors)
    SetNuiFocus(true, true)
    SendNUIMessage({ 
        action = 'SHOW_UI',
        current = current,
        floors = floors
    })
end

-- NUI Callbacks --
RegisterNUICallback('CLOSE_UI', function()
    SetNuiFocus(false, false)
end)

RegisterNUICallback('TELEPORT', function(data, cb)
    Teleport(vec3(data.pos.x, data.pos.y, data.pos.z))
end)

RegisterNUICallback('USE_ELEVATOR', function(data, cb)
    NetworkFadeOutEntity(cache.ped, true, false)
    DoScreenFadeOut(1000)
end)

-- setup points --
local draw = config.draw_dist
local interact = config.interact_dist
local open = config.texts.open
for _, data in each(config.elevators) do
    for _, floor in each(data) do

        local point = lib.points.new({
            coords = floor.pos,
            distance = draw
        })
        
        function point:nearby()
            Draw3DText(self.coords.x, self.coords.y, self.coords.z, open)

            if self.currentDistance < interact and IsControlJustReleased(0, 38) then
                OpenUI(floor.number, data)
            end
        end
    end
end
