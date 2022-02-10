const appRoot = document.getElementById('app-root');

const renderForm = () => {
   appRoot.insertAdjacentHTML('beforeEnd', `
      <form class="main-form" method="get" action="#">
         <div class="search-group">
            <span class="search-group__label">Please choose type of search:</span>
            <div class="radio-group">
            <label class="radio-group__item">
               <input type="radio" name="radio-search" id="byregion">
               <span>By Region</span>
            </label>
            <label class="radio-group__item">
               <input type="radio" name="radio-search" id="bylanguage">
               <span>By Language</span>
            </label>
            </div>
         </div>
         <div class="search-group">
            <span>Please choose search query:</span>
            <select class="search-group__select" name="selectList" id="selectQuery" disabled>
               <option value="select value" selected>Select value</option>
            </select>
         </div>
      </form>
   `);
}

const renderTable = () => {   
   appRoot.insertAdjacentHTML('beforeEnd', `
      <table class="results">
         <thead>
            <tr>
               <th>
                  Country name
                  <button class="sort-button" data-state="up-down" aria-label="Sort by name button"></button>
               </th>
               <th>Capital</th>
               <th>World region</th>
               <th>Languages</th>
               <th>
                  Area
                  <button class="sort-button" data-state="up-down" 
                           aria-label="Sort by area button">
                  </button>
               </th>
               <th>Flag</th>
            </tr>
         </thead>
         <tbody>
         </tbody>
      </table>
   `);
}

const getOptionsList = (radioType) => {
   switch (radioType) {
      case 'byregion': {
         return externalService.getRegionsList();
      }
      case 'bylanguage': {
         return externalService.getLanguagesList();
      }
      default: {
         throw new Error('No data found');
      }
   }
}

const getTableData = (selectedType, selectedValue) => {
   switch (selectedType) {
      case 'byregion': {
         return externalService.getCountryListByRegion(selectedValue);
      }
      case 'bylanguage': {
         return externalService.getCountryListByLanguage(selectedValue);
      }
      default: {
         throw new Error('No data found');
      }
   }
}

const isSelected = (selectList) => {
   return !!selectList.selectedIndex;
}

const unlockSelect = (selectList) => {
   if (selectList.hasAttribute('disabled')) {
      selectList.removeAttribute('disabled'); 
   }
}

const clearSelectChilds = (selectList) => {
   while (selectList.lastChild.value !== 'select value') {
      selectList.removeChild(selectList.lastChild);
   }
}

const clearPreviousResults = () => {
   if (appRoot.children.length > 1) {
      appRoot.removeChild(appRoot.lastElementChild);
   }
}

const noFoundSelectedOption = (selectList) => {
   if (!isSelected(selectList)) {
      appRoot.insertAdjacentHTML('beforeEnd', '<span>No items, please choose search query</span>');
   }
}

const addSelectData = (selectList, optionsList) => {
   optionsList.forEach(optionItem => {
      const option = document.createElement('option');
      option.setAttribute('value', optionItem);
      option.insertAdjacentText('afterbegin', optionItem);

      selectList.insertAdjacentElement('beforeend', option);
   });
}

const addTableData = (selectedType, selectedValue) => {
   const tableData = getTableData(selectedType, selectedValue);
   const tableResults = document.querySelector('table.results tbody');

   tableData.forEach(data => {
      const tr = document.createElement('tr');
      tr.insertAdjacentHTML('beforeEnd', `
         <tr>
            <td>${data.name}</td>
            <td>${data.capital}</td>
            <td>${data.region}</td>
            <td>${Object.values(data.languages).join(', ')}</td>
            <td>${data.area}</td>
            <td><img src="${data.flagURL}" alt="${data.name} flag"></td>
         <tr>
      `);

      tableResults.insertAdjacentElement('beforeEnd', tr);
   });

   sortDataByName();
}

const selectPreparation = (optionsList) => {
   const selectList = document.querySelector('.search-group__select');

   clearPreviousResults();
   unlockSelect(selectList);
   clearSelectChilds(selectList);
   noFoundSelectedOption(selectList);
   addSelectData(selectList, optionsList);
}

const selectSearchType = () => {
   const radios = document.querySelectorAll("input[type='radio']");

   radios.forEach(radio => {
      radio.addEventListener('change', (event) => {
         const radioType = event.target.getAttribute('id');
         const optionsList = getOptionsList(radioType);

         selectPreparation(optionsList);
      });
   })
}

const getSelectedSearchType = () => {
   return document.querySelector("input[type='radio']:checked").id;
}

const selectSearchQuery = () => {
   const selectList = document.querySelector('.search-group__select');
   
   selectList.addEventListener('change', () => {
      clearPreviousResults();
      noFoundSelectedOption(selectList);
      
      if (isSelected(selectList)) {
         const selectedValue = selectList.options[selectList.selectedIndex].value;
         const selectedType = getSelectedSearchType();

         renderTable();
         addTableData(selectedType, selectedValue);
         sortOptions();
      }
   })   
}

const sortDataByName = () => {
   const sortByNameButton = document.querySelectorAll('.sort-button')[0];
   const order = changeSortButtonState(sortByNameButton);

   const tableData = document.querySelector('table.results tbody');
   const tableResults = Array.from(tableData.children);
   tableResults.sort((a, b) => {
      const firstCountry = a.querySelector('td').innerText;
      const secondCountry = b.querySelector('td').innerText;

      if (firstCountry < secondCountry) {
         return order; 
      } else if (firstCountry > secondCountry) {
         return -order; 
      }
      return 0;
   });

   tableData.innerHTML = '';
   tableResults.forEach(result => {
      tableData.insertAdjacentElement('beforeEnd', result);
   });
}

const sortDataByArea = () => {
   const sortByAreaButton = document.querySelectorAll('.sort-button')[1];
   const order = changeSortButtonState(sortByAreaButton);

   const tableData = document.querySelector('table.results tbody');
   const tableResults = Array.from(tableData.children);
   const AREAINDEX = 4;

   tableResults.sort((a, b) => {
      const firstCountry = +a.querySelectorAll('td')[AREAINDEX].innerText;
      const secondCountry = +b.querySelectorAll('td')[AREAINDEX].innerText;

      if (firstCountry < secondCountry) {
         return order; 
      } else if (firstCountry > secondCountry) {
         return -order; 
      }
      return 0;
   });

   tableData.innerHTML = '';
   tableResults.forEach(result => {
      tableData.insertAdjacentElement('beforeEnd', result);
   });
}

const changeSortButtonState = (sortButton) => {
   const DEC = 1, INC = -1;
   const currentState = sortButton.dataset.state;

   switch (currentState) {
      case 'up-down': {
         sortButton.setAttribute('data-state', 'up');
         return INC;
      }
      case 'up': {
         sortButton.setAttribute('data-state', 'down');
         return DEC;
      }
      case 'down': {
         sortButton.setAttribute('data-state', 'up');
         return INC;
      }
      default: {
         break;
      }
   }
}

const clearSortButtonState = (sortButton) => {
   sortButton.setAttribute('data-state', 'up-down');
}

const sortOptions = () => {
   const sortButtons = document.querySelectorAll('.sort-button');

   const sortByNameButton = sortButtons[0];
   const sortByAreaButton = sortButtons[1];

   sortByNameButton.addEventListener('click', () => {
      clearSortButtonState(sortByAreaButton);
      sortDataByName();
   });
   sortByAreaButton.addEventListener('click', () => {
      clearSortButtonState(sortByNameButton);
      sortDataByArea();
   });
}

const render = () => {
   renderForm();

   selectSearchType();
   selectSearchQuery();
}

render();