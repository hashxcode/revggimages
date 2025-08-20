const isEnvBrowser = () => !window.invokeNative;

const sendMessage = async (type, data = {}, mock = {}) => {
	if (isEnvBrowser()) return mock;
	const response = await fetch(`https://rev-charselect/${type}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: JSON.stringify(data),
	});
	const responseData = await response.json();
	return responseData;
};

document.addEventListener('DOMContentLoaded', () => {
	sendMessage('ready');
	let locations = [
		{
			image: './assets/last.webp',
			name: 'Ostatnia lokalizacja',
			id: 'last',
		},
		{
			image: './assets/sandy.webp',
			name: 'Sandy Shores',
			id: 'sandy',
		},
		{
			image: './assets/paleto.webp',
			name: 'Paleto Bay',
			id: 'paleto',
		},
		{
			image: './assets/apartments.webp',
			name: 'Apartamenty',
			id: 'apartments',
		},
	];

	const setupLocations = (locations) => {
		let locked = false;
		let selectedLocation = null;
		let cursor = 1;
		const updateCursor = (newCursor) => {
			cursor = newCursor;
			sendMessage('setCursor', cursor);
		};
		const handleHoverStart = () => {
			updateCursor(3);
		};
		const handleHoverEnd = () => {
			updateCursor(1);
		};
		const handleMouseDown = () => {
			updateCursor(4);
		};
		const handleMouseUp = () => {
			updateCursor(3);
		};
		const confirmButtonAction = () => {
			if (locked) return;
			locked = true;
			const { success } = sendMessage(
				'acceptLocation',
				{
					id: locations[selectedLocation].id,
				},
				{ success: true },
			);
			locked = false;
		};
		const cancelButtonAction = () => {
			if (locked) return;
			locked = true;
			const { success } = sendMessage(
				'acceptLocation',
				{},
				{ success: true },
			);
			locked = false;
		};
		const locationContainer = document.querySelector('.locations');
		locationContainer.innerHTML = '';
		for (let i = 0; i < locations.length; i++) {
			const location = locations[i];
			const locationElement = document.createElement('div');
			locationElement.classList.add('location');
			locationElement.innerHTML = `
                <img src="${location.image}" />
                <div class="overlay"></div>
                <div class="selected">Wybrano lokalizację</div>
                <div class="label">${location.name}</div>
            `;
			locationContainer.appendChild(locationElement);
		}

		const confirmButton = document.querySelector('.confirm');
		confirmButton.classList.add('disabled');
		const cancelButton = document.querySelector('.cancel');

		const allLocations = document.querySelectorAll('.location');
		allLocations.forEach((location, i) => {
			location.classList.remove('select');
			location.addEventListener('click', () => {
				if (selectedLocation !== null) {
					allLocations[selectedLocation].classList.remove('select');
				}
				if (selectedLocation === i) {
					selectedLocation = null;
					confirmButton.classList.add('disabled');
					return;
				}
				selectedLocation = i;
				location.classList.add('select');
				confirmButton.classList.remove('disabled');
			});
			location.addEventListener('mouseover', handleHoverStart);
			location.addEventListener('mouseout', handleHoverEnd);
			location.addEventListener('mousedown', handleMouseDown);
			location.addEventListener('mouseup', handleMouseUp);
		});

		confirmButton.addEventListener('click', confirmButtonAction);
		confirmButton.addEventListener('mouseover', handleHoverStart);
		confirmButton.addEventListener('mouseout', handleHoverEnd);
		confirmButton.addEventListener('mousedown', handleMouseDown);
		confirmButton.addEventListener('mouseup', handleMouseUp);

		cancelButton.addEventListener('click', cancelButtonAction);
		cancelButton.addEventListener('mouseover', handleHoverStart);
		cancelButton.addEventListener('mouseout', handleHoverEnd);
		cancelButton.addEventListener('mousedown', handleMouseDown);
		cancelButton.addEventListener('mouseup', handleMouseUp);
	};

	const handleMessage = (data) => {
		if (data.type === 'setLocations') {
			locations = data.locations;
			setupLocations(locations);
		}
	};

	window.addEventListener('message', (event) => {
		handleMessage(event.data);
	});

	if (isEnvBrowser()) {
		handleMessage({
			type: 'setLocations',
			locations: [
				{
					image: './assets/last.webp',
					name: 'Ostatnia lokalizacja',
					id: 'last',
				},
				{
					image: './assets/sandy.webp',
					name: 'Sandy Shores',
					id: 'sandy',
				},
				{
					image: './assets/paleto.webp',
					name: 'Paleto Bay',
					id: 'paleto',
				},
				{
					image: './assets/apartaments.webp',
					name: 'Apartamenty',
					id: 'apartments',
				},
			],
		});
	}
});
