const configUrl = '../ItemConfig.json';
let itemsConfig = null;
let optionsConfig = null;
let presetsConfig = null; // Добавлено для хранения пресетов

// Функция для загрузки конфигурации
function loadConfiguration(url) {
	// Возвращаем fetch промис непосредственно
	return fetch(url)
					.then(response => {
							if (!response.ok) {
									throw new Error('Network response was not ok');
							}
							return response.json();
					})
					.then(data => {
							itemsConfig = data.items;
							optionsConfig = data.options;
							presetsConfig = data.presets; // Загрузка пресетов
					})
					.catch(error => console.error('Ошибка загрузки конфигурации:', error));
}

// Функция для создания опции айтема
function createOption(areaId, itemId, optionId, isSelected, itemContainer) {
	let li = document.createElement('li');
	li.className = 'item__option';

	let input = document.createElement('input');
	input.type = 'checkbox';
	input.id = `${areaId}-${itemId}-${optionId}`;
	input.dataset.option = optionId;
	input.checked = isSelected;

	input.addEventListener('change', function() {
			updateOutputLog(); // Обновление лога

			if (!itemContainer.isExpanded) {
					// Если список свернут, скрываем невыбранный чекбокс
					li.style.display = input.checked ? "block" : "none";
			}
			updateHiddenOptionsCount(itemContainer);
	});

	let label = document.createElement('label');
	label.htmlFor = `${areaId}-${itemId}-${optionId}`;
	label.textContent = optionId;

	li.appendChild(input);
	li.appendChild(label);

	if (!isSelected) {
			li.style.display = "none"; // Скрываем неотмеченные опции
	}

	return li;
}


// Внутренняя функция генерации айтема
function generateItemInternal(areaId, itemId, itemsConfig, optionsConfig) {
    let itemData = itemsConfig.find(item => item.id === itemId);
    if (!itemData) {
        return null;
    }

    let itemContainer = document.createElement('div');
    itemContainer.className = 'item';
		itemContainer.isExpanded = false; // Начальное состояние - свернуто
		itemContainer.dataset.id = itemId;

		// Обработчик события mouseleave
		itemContainer.addEventListener('mouseleave', function() {
			if (itemContainer.isExpanded) {
					toggleOptionsVisibility(itemContainer);
			}
		});

    let itemHeader = document.createElement('div');
    itemHeader.className = 'item__header';

    let itemImageDiv = document.createElement('div');
    itemImageDiv.className = 'item__image';

    let itemImage = document.createElement('img');
    itemImage.src = itemData.imagePath;
    itemImage.alt = itemData.title;
    itemImageDiv.appendChild(itemImage);

    let itemTitle = document.createElement('div');
    itemTitle.className = 'item__title';
    itemTitle.textContent = itemData.title;

    itemHeader.appendChild(itemImageDiv);
    itemHeader.appendChild(itemTitle);

    let deleteButton = document.createElement('button');
    deleteButton.className = 'item__delete';
    deleteButton.innerHTML = `
        <svg width="8" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.99998 -0.000206962C2.7441 -0.000206962 2.48794 0.0972617 2.29294 0.292762L0.292945 2.29276C-0.0980552 2.68376 -0.0980552 3.31682 0.292945 3.70682L7.58591 10.9998L0.292945 18.2928C-0.0980552 18.6838 -0.0980552 19.3168 0.292945 19.7068L2.29294 21.7068C2.68394 22.0978 3.31701 22.0978 3.70701 21.7068L11 14.4139L18.2929 21.7068C18.6829 22.0978 19.317 22.0978 19.707 21.7068L21.707 19.7068C22.098 19.3158 22.098 18.6828 21.707 18.2928L14.414 10.9998L21.707 3.70682C22.098 3.31682 22.098 2.68276 21.707 2.29276L19.707 0.292762C19.316 -0.0982383 18.6829 -0.0982383 18.2929 0.292762L11 7.58573L3.70701 0.292762C3.51151 0.0972617 3.25585 -0.000206962 2.99998 -0.000206962Z"/>
        </svg>
    `;
		deleteButton.addEventListener('click', function() {
			// Логика удаления айтема
			itemHeader.parentElement.remove();
			updateOutputLog(); // Обновить лог после удаления
	});
		itemHeader.appendChild(deleteButton);

    let itemOptions = document.createElement('ul');
    itemOptions.className = 'item__options';

	optionsConfig.forEach(optionId => {
		let isSelected = itemData.defaultOptions.includes(optionId);
		itemOptions.appendChild(createOption(areaId, itemId, optionId, isSelected, itemContainer));
	});
	let hiddenOptionsCount = optionsConfig.length - itemData.defaultOptions.length;
	let addMore = document.createElement('div');
	addMore.className = 'item__addOption';
	addMore.textContent = `ADD MORE (${hiddenOptionsCount})`;
	addMore.onclick = function() {
			toggleOptionsVisibility(itemContainer);
	};

	let pinButton = document.createElement('button');
	pinButton.className = 'item__pin';
	pinButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.31 3.48309L8.53119 1.70253C7.31519 0.485341 6.70721 -0.123256 6.05418 0.0208096C5.40121 0.164881 5.10511 0.972929 4.51297 2.58903L4.1122 3.68285C3.95434 4.11369 3.87541 4.32911 3.7334 4.49574C3.66968 4.57051 3.59718 4.63731 3.51747 4.6947C3.33983 4.82261 3.11883 4.88351 2.67684 5.00537C1.68062 5.27999 1.18252 5.41733 0.994813 5.74325C0.91367 5.88413 0.871442 6.04409 0.872468 6.20675C0.874844 6.58288 1.24017 6.94858 1.97084 7.67998L2.81958 8.52976L0.134067 11.2178C-0.0446891 11.3967 -0.0446891 11.6869 0.134067 11.8658C0.312823 12.0447 0.602651 12.0447 0.781407 11.8658L3.46701 9.17764L4.3466 10.0581C5.08189 10.7941 5.44956 11.1621 5.82798 11.1627C5.98746 11.1629 6.14418 11.1215 6.28272 11.0424C6.61145 10.8548 6.74951 10.353 7.02563 9.34948C7.14707 8.9083 7.20773 8.68768 7.33517 8.51008C7.39097 8.43238 7.45565 8.36146 7.528 8.29882C7.69318 8.15578 7.9072 8.07538 8.33524 7.91458L9.44163 7.49884C11.0399 6.89836 11.839 6.59812 11.9799 5.94689C12.1207 5.29559 11.5171 4.69142 10.31 3.48309Z" fill="#373333"/></svg>`;
	pinButton.style.opacity = 0.3;

	// Добавляем обработчик клика для изменения состояния пина
	pinButton.addEventListener('click', function() {
			togglePinState(pinButton);
	});


	itemContainer.appendChild(itemHeader);
	itemContainer.appendChild(itemOptions);
	itemContainer.appendChild(addMore);
	itemHeader.insertBefore(pinButton, itemHeader.firstChild);
	
	updateHiddenOptionsCount(itemContainer);

	return itemContainer;
}

// Генератор айтема
function generateItem(areaId, itemId) {
    if (!itemsConfig || !optionsConfig) {
        console.error('Конфигурация еще не загружена.');
        return null;
    }
    return generateItemInternal(areaId, itemId, itemsConfig, optionsConfig);
}

// Обертка для упрощенного вызова генерации айтема
function createAndAppendItem(itemId, targetSelector) {
	let item = generateItem(itemId);
	if (item) {
			document.querySelector(targetSelector).appendChild(item);
	}
}

loadConfiguration(configUrl).then(() => {
	const addButtons = document.querySelectorAll('.addItemButton');
	addButtons.forEach(button => {
			button.addEventListener('click', openItemSelectionMenu);
	});
});





let closeMenu;
function openItemSelectionMenu(event) {
	if (!itemsConfig) {
			console.error('Конфигурация айтемов еще не загружена.');
			return;
	}

	const workspaceElement = event.currentTarget.closest('.workspace');
	const isMobileWorkspace = workspaceElement.classList.contains('workspace__mobile');
	const targetSelector = isMobileWorkspace ? '#mobileDroppable' : '#dataDroppable';
	
	let overlay = workspaceElement.querySelector('.workspace-overlay');
	if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'workspace-overlay';
			workspaceElement.appendChild(overlay);
	}
	overlay.style.display = 'block';

	let menu = document.getElementById('itemSelectionMenu');
	if (!menu) {
			menu = document.createElement('div');
			menu.id = 'itemSelectionMenu';
			workspaceElement.appendChild(menu);
	}

	// Обновление списка существующих айтемов
	const targetContainer = document.querySelector(targetSelector);
	const existingItemIds = new Set(Array.from(targetContainer.querySelectorAll('.item')).map(item => item.dataset.id));

		const itemList = itemsConfig.map(item => {
			const isItemExisting = existingItemIds.has(item.id);
			const blackImagePath = item.imagePath.replace('/image/', '/image/black/');
			return `<li class="${isItemExisting ? 'disabled' : ''}" 
			${!isItemExisting ? `onclick="selectItem('${item.id}', '${targetSelector}'); closeMenu();"` : ''}>
			<img src="${blackImagePath}" alt="${item.title}" class="menu-icon">
			${item.title}
	</li>`;
	}).join('');

	menu.innerHTML = `<ul>${itemList}</ul>`;

	const buttonRect = event.currentTarget.getBoundingClientRect();
	menu.style.display = 'block';
	menu.style.position = 'absolute';
	setTimeout(() => {
			const menuWidth = menu.offsetWidth;
			menu.style.left = `${buttonRect.right - menuWidth + window.scrollX}px`;
			menu.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
	}, 0);

	closeMenu = function() {
		menu.style.display = 'none';
		overlay.style.display = 'none';
		document.removeEventListener('click', closeMenuOnClickOutside);
};

	// Функция для закрытия меню и оверлея при клике вне них
	function closeMenuOnClickOutside(event) {
			if (!menu.contains(event.target) && !event.target.matches('.addItemButton')) {
					closeMenu();
			}
	}

	setTimeout(() => {
			document.addEventListener('click', closeMenuOnClickOutside);
	}, 0);
}


// Функция для выбора айтема из меню
function selectItem(itemId, targetSelector) {
	const areaId = targetSelector.includes('mobile') ? 'mobile' : 'data';
	const itemElement = generateItem(areaId, itemId);
	if (itemElement) {
			const container = document.querySelector(targetSelector);
			container.appendChild(itemElement);
			itemElement.dataset.id = itemId; // Установить data-id для нового элемента

			// Обновить список существующих элементов
			const existingItemIds = new Set([...container.querySelectorAll('.item')].map(el => el.dataset.id));
			
			closeMenu();
			updateOutputLog();
	}
}

// Обработчики для кнопок ADD ITEM
document.addEventListener('DOMContentLoaded', () => {
	const addButtons = document.querySelectorAll('.addItemButton');
	addButtons.forEach(button => {
			button.addEventListener('click', openItemSelectionMenu);
	});
});


function toggleOptionsVisibility(itemContainer) {
	const options = itemContainer.querySelectorAll('.item__option input[type="checkbox"]');
	itemContainer.isExpanded = !itemContainer.isExpanded;

	let hiddenOptionsCount = 0;

	options.forEach(option => {
			const optionLi = option.parentElement;
			if (itemContainer.isExpanded) {
					optionLi.style.display = "block";
			} else {
					if (!option.checked) {
							optionLi.style.display = "none";
							hiddenOptionsCount++;
					}
			}
	});

	const addMoreBtn = itemContainer.querySelector('.item__addOption');
	if (itemContainer.isExpanded) {
			addMoreBtn.textContent = 'LESS';
	} else {
			addMoreBtn.textContent = `ADD MORE (${hiddenOptionsCount})`;
	}
}
function updateHiddenOptionsCount(itemContainer) {
	const options = itemContainer.querySelectorAll('.item__option input[type="checkbox"]');
	let hiddenOptionsCount = 0;

	options.forEach(option => {
			if (!option.checked) {
					hiddenOptionsCount++;
			}
	});

	const addMoreBtn = itemContainer.querySelector('.item__addOption');
	addMoreBtn.textContent = itemContainer.isExpanded ? 'LESS' : `ADD MORE (${hiddenOptionsCount})`;
}

function togglePinState(clickedPin) {
	const workspaceElement = clickedPin.closest('.workspace');
	const allPins = workspaceElement.querySelectorAll('.item__pin');

	// Если кликнутый пин уже активен, отключаем его и делаем невидимым
	if (clickedPin.dataset.active === 'true') {
			clickedPin.style.opacity = 0.3; // или clickedPin.style.visibility = 'hidden';
			clickedPin.dataset.active = 'false';
	} else {
			// Сначала сбросим все пины в неактивное и видимое состояние
			allPins.forEach(pin => {
					pin.style.opacity = 0.3; // или pin.style.visibility = 'visible';
					pin.dataset.active = 'false';
			});

			// Активируем кликнутый пин
			clickedPin.style.opacity = 1; // или clickedPin.style.visibility = 'visible';
			clickedPin.dataset.active = 'true';
	}

	updateOutputLog();
}















/* Log */
function updateOutputLog() {
    const dataDroppableItems = document.getElementById('dataDroppable').querySelectorAll('.item');
    const mobileDroppableItems = document.getElementById('mobileDroppable').querySelectorAll('.item');

    let outputData = {};

    // Обработка айтемов для dataDroppable
    if (dataDroppableItems.length > 0) {
        outputData.data = processDataItems(dataDroppableItems, 'data');
    }

    // Обработка айтемов для mobileDroppable
    if (mobileDroppableItems.length > 0) {
        outputData.mobileData = processDataItems(mobileDroppableItems, 'mobile');
    } else {
        // Если в mobileDroppable нет элементов, удаляем ключ mobileData
        delete outputData.mobileData;
    }

    // Форматирование и вывод данных в textarea
    const outputTextArea = document.getElementById('outputLog');
    outputTextArea.value = JSON.stringify(outputData, null, 2);
}

function formatDataForOutput() {
	// Получаем элементы областей
	const dataDroppableItems = document.getElementById('dataDroppable').querySelectorAll('.item');
	const mobileDroppableItems = document.getElementById('mobileDroppable').querySelectorAll('.item');

	let outputData = {
			data: { availableExperiences: [], availableModes: {} },
			// mobileData будет добавлено ниже, если есть элементы
	};

	// Перебор элементов в dataDroppable и формирование данных
	outputData.data = processDataItems(dataDroppableItems, 'data');
	if (mobileDroppableItems.length > 0) {
			outputData.mobileData = processDataItems(mobileDroppableItems, 'mobile');
	}

	return JSON.stringify(outputData, null, 2);
}

function processDataItems(items, area) {
	let experiences = [];
	let modes = {};
	let activeExperience = null;

	items.forEach(item => {
			const experienceId = item.dataset.id;
			const options = Array.from(item.querySelectorAll('input[type="checkbox"]:checked'))
													 .map(input => input.dataset.option);
			
			// Добавляем опыт и режимы
			experiences.push(experienceId);
			modes[experienceId] = options;

			// Проверяем, активен ли пин
			const pin = item.querySelector('.item__pin');
			if (pin && pin.dataset.active === 'true') {
					activeExperience = experienceId; // Если пин активен, сохраняем идентификатор опыта
			}
	});

	// Возвращаем объект с данными
	return {
			availableExperiences: experiences,
			availableModes: modes,
			...(activeExperience && { activeExperience }) // Добавляем activeExperience, если он определен
	};
}
// Функция копирования текста из textarea в буфер обмена
function copyToClipboard(text) {
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextArea);
}
// Функция для показа и скрытия overlay
function flashCopyOverlay() {
  const overlay = document.querySelector('.copy__overlay');
  overlay.style.display = 'flex';
  overlay.style.opacity = '.2';
  // Устанавливаем таймер для начала анимации скрытия
  setTimeout(() => {
    overlay.style.opacity = '0';
  }, 500);
  // Устанавливаем таймер для окончательного скрытия overlay после анимации
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 1000);
}

document.getElementById('copyOutputButton').addEventListener('click', function() {
  const textToCopy = document.getElementById('outputLog').value;
  navigator.clipboard.writeText(textToCopy).then(() => {
    flashCopyOverlay();
  }).catch(err => {
    console.error('Не удалось скопировать текст: ', err);
  });
});
document.getElementById('clearOutputButton').addEventListener('click', function() {
  // Получаем контейнеры
  const dataDroppable = document.getElementById('dataDroppable');
  const mobileDroppable = document.getElementById('mobileDroppable');

  // Очищаем контейнеры
  dataDroppable.innerHTML = '';
  mobileDroppable.innerHTML = '';

  // Обновляем лог
  updateOutputLog();
});

function applyPreset(presetName, targetSelector) {
	const presetItems = presetsConfig[presetName];
	if (!presetItems) {
			return;
	}

	// Очищаем целевой контейнер перед добавлением новых айтемов
	const container = document.querySelector(targetSelector);
	container.innerHTML = '';

	presetItems.forEach(itemId => {
			// Находим данные айтема по ID
			const itemData = itemsConfig.find(item => item.id === itemId);
			if (itemData) {
					const newItem = generateItemInternal('data', itemId, itemsConfig, optionsConfig);
					if (newItem) {
							container.appendChild(newItem);
					}
			} else {
			}
	});

	updateOutputLog();
}

// Добавляем обработчик событий для ссылок пресетов
document.querySelectorAll('.preset__link').forEach(link => {
	link.addEventListener('click', function(event) {
			event.preventDefault();
			const presetName = this.dataset.preset;
			applyPreset(presetName, '#dataDroppable');
	});
});












/* SORTABLE JS */
function onStart(event) {
	// Получаем data-id элемента, который начали перетаскивать
	const draggedId = event.item.getAttribute('data-id');
	
	// Проверяем, есть ли элемент с таким же data-id в обоих контейнерах
	const existsInData = !!document.querySelector(`#dataDroppable .item[data-id="${draggedId}"]`);
	const existsInMobile = !!document.querySelector(`#mobileDroppable .item[data-id="${draggedId}"]`);
	
	// Если элемент с таким data-id уже есть в другом контейнере, сохраняем эту информацию
	event.item.dataset.preventDragging = (existsInData && existsInMobile).toString();
}

function onMove(event) {
	// Если перетаскивание элемента нужно предотвратить, возвращаем false
	if (event.dragged.dataset.preventDragging === 'true') {
			return false;
	}
}
const onEndUpdate = function() {
	updateOutputLog();
};

document.addEventListener('DOMContentLoaded', function() {
	loadConfiguration(configUrl).then(() => {
			// Инициализация Sortable для 'dataDroppable'
			new Sortable(document.getElementById('dataDroppable'), {
					animation: 150,
					group: 'shared',
					ghostClass: 'sortable-ghost',
					onStart: onStart,
					onMove: onMove,
					onEnd: onEndUpdate
			});

			// Инициализация Sortable для 'mobileDroppable'
			new Sortable(document.getElementById('mobileDroppable'), {
					animation: 150,
					group: 'shared',
					ghostClass: 'sortable-ghost',
					onStart: onStart,
					onMove: onMove,
					onEnd: onEndUpdate
			});
	});
});