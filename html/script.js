document.addEventListener('DOMContentLoaded', () => {
    let floors = [
        /* { number: 0, name: 'Main'},
        { number: 1},
        { number: 2, code: '1234' },
        { number: 3},
        { number: 4, code: '5678' },
        { number: 5, name: 'Roof'},
        { number: 6},
        { number: 7},
        { number: 8, code: '8765' },
        { number: 9},
        { number: 10},
        { number: 11},
        { number: 12, code: '4321' }, */
    ];

    const floorColumnsContainer = document.getElementById('floor-columns');
    const digit1 = document.getElementById('digit-1');
    const digit2 = document.getElementById('digit-2');
    const directionUp = document.getElementById('direction-up');
    const directionDown = document.getElementById('direction-down');
    const stopButton = document.getElementById('stop-button');
    const buttonSound = document.getElementById('button-sound');
    const arrivalSound = document.getElementById('arrival-sound');
    const ambientSound = document.getElementById('ambient-sound');
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.close-button');
    const submitPasswordButton = document.getElementById('submit-password');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    let currentFloor = 1;
    let isAnimating = false;
    let activeButton = null;
    let animationInterval = null;
    let targetFloor = null;
    let targetFloorButton = null;
    let targetFloorCode = null;
    const floorTravelTime = 2500;
    const startDelay = 5000;

    // esc
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (activeButton) { return; }
            closeElevatorUI();
        }
    });

    function closeElevatorUI() {
        $.post(`https://${GetParentResourceName()}/CLOSE_UI`);
        document.body.classList.add('hidden');
        setTimeout(() => {
            document.body.style.display = 'none';
        }, 500);
    }

    function openElevatorUI() {
        document.body.style.display = 'flex';
        setTimeout(() => {
            document.body.classList.remove('hidden');
        }, 10);
    }

    function createColumn(floors) {
        const columnDiv = document.createElement('div');
        columnDiv.classList.add('floor-column');
        floors.reverse().forEach(floor => {
            const button = document.createElement('button');
            button.classList.add('floor-button');
            button.setAttribute('data-floor', floor.number);
            button.textContent = floor.number;
            columnDiv.appendChild(button);
    
            if (floor.name) {
                const tooltip = document.createElement('span');
                tooltip.classList.add('tooltip');
                tooltip.textContent = floor.name;
                button.appendChild(tooltip);
            }
    
            button.addEventListener('click', () => {
                if (activeButton) { return; }

                targetFloor = parseInt(button.getAttribute('data-floor'));
                targetFloorButton = button;
                targetFloorCode = floor.code;

                if (floor.code) {
                    openModal();
                } else {
                    proceedToFloor(button, targetFloor, floor);
                }
            });
        });
        return columnDiv;
    }

    function proceedToFloor(button, targetFloor, data) {
        if (targetFloor !== currentFloor && !isAnimating) {
            $.post(`https://${GetParentResourceName()}/USE_ELEVATOR`, 
                JSON.stringify({ pos: data.pos }
            )); 

            buttonSound.pause();
            buttonSound.currentTime = 0;
            buttonSound.play();

            ambientSound.pause();
            ambientSound.currentTime = 0;
            ambientSound.play();

            if (activeButton) {
                activeButton.classList.remove('active-floor');
            }
            button.classList.add('active-floor');
            activeButton = button;
            setTimeout(() => animateFloorChange(currentFloor, targetFloor, data.pos), startDelay);
        }
    }

    function openModal() {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
            modal.classList.remove('hide');
        }, 10);
        errorMessage.textContent = '';
        passwordInput.value = '';
    }
    
    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    closeButton.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    submitPasswordButton.addEventListener('click', () => {
        const inputCode = passwordInput.value;
        if (inputCode === targetFloorCode) {
            closeModal();
            proceedToFloor(targetFloorButton, targetFloor, floors[targetFloor]);
        } else {
            errorMessage.textContent = 'Incorrect code!';
            errorMessage.classList.add('shake');
            setTimeout(() => errorMessage.classList.remove('shake'), 300);
        }
    });    

    const leftColumnFloors = floors.filter((floor, index) => index % 2 === 0);
    const rightColumnFloors = floors.filter((floor, index) => index % 2 !== 0);

    floorColumnsContainer.appendChild(createColumn(leftColumnFloors));
    floorColumnsContainer.appendChild(createColumn(rightColumnFloors));

    function updateFloorDisplay(floor) {
        const floorStr = floor.toString();
        if (floorStr.length === 1) {
            digit1.textContent = floorStr;
            digit2.textContent = '';
            digit1.style.left = '60%';
        } else {
            digit1.textContent = floorStr[0];
            digit2.textContent = floorStr[1];
            digit1.style.left = '51%';
            digit2.style.left = '60%';
        }

        if (floor === 1) {
            digit1.style.left = '70%';
        } else if (floor === 11) {
            digit1.style.left = '70%'; 
            digit2.style.left = '52%';
        } else if (floor === 20) {
            digit1.style.left = '40%'; 
            digit2.style.left = '60%';
        }
    }

    function animateFloorChange(from, to, pos) {
        isAnimating = true;
        let step = from < to ? 1 : -1;
        if (step === 1) {
            directionUp.style.color = 'white';
            directionDown.style.color = 'rgba(255, 255, 255, 0.3)';
        } else {
            directionUp.style.color = 'rgba(255, 255, 255, 0.3)';
            directionDown.style.color = 'white';
        }

        animationInterval = setInterval(() => {
            currentFloor += step;
            updateFloorDisplay(currentFloor);

            if (currentFloor === to) {
                clearInterval(animationInterval);
                directionUp.style.color = 'rgba(255, 255, 255, 0.3)';
                directionDown.style.color = 'rgba(255, 255, 255, 0.3)';
                isAnimating = false;

                $.post(`https://${GetParentResourceName()}/TELEPORT`, 
                    JSON.stringify({ pos: pos }
                )); 

                ambientSound.pause();

                setTimeout(() => {
                    arrivalSound.play();
                    if (activeButton) {
                        activeButton.classList.remove('active-floor');
                        activeButton = null;
                    }
                }, 500);
            }
        }, floorTravelTime);
    }

    stopButton.addEventListener('click', () => {
        buttonSound.currentTime = 0;
        buttonSound.play();

        if (isAnimating) {
            clearInterval(animationInterval);
            directionUp.style.color = 'rgba(255, 255, 255, 0.3)';
            directionDown.style.color = 'rgba(255, 255, 255, 0.3)';
            isAnimating = false;
            if (activeButton) {
                $.post(`https://${GetParentResourceName()}/TELEPORT`, 
                    JSON.stringify({ pos: floors[currentFloor].pos }
                ));
                ambientSound.pause();
                arrivalSound.play();
                activeButton.classList.remove('active-floor');
                activeButton = null;
            }
        }
    });

    window.addEventListener("message", (event) => {
        const data = event.data;
        const action = data.action;
        if (action === "SHOW_UI") {
            const initialData = {
                current: data.current,
                floors: data.floors
            };
            initializeElevatorUI(initialData);
            openElevatorUI()
        }
    });

    updateFloorDisplay(currentFloor);

    function initializeElevatorUI(data) {
        floors = data.floors;
        currentFloor = data.current;
        floorColumnsContainer.innerHTML = '';
    
        const leftColumnFloors = floors.filter((floor, index) => index % 2 === 0);
        const rightColumnFloors = floors.filter((floor, index) => index % 2 !== 0);
    
        floorColumnsContainer.appendChild(createColumn(leftColumnFloors));
        floorColumnsContainer.appendChild(createColumn(rightColumnFloors));
    
        updateFloorDisplay(currentFloor);
    }

    // close UI on start
    document.body.style.display = 'none';
});
