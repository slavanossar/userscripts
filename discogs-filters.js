// ==UserScript==
// @name           Discogs Filters
// @namespace      discogs.com
// @description    Filters marketplace items Rating, Wanted & Rarity
// @version        1.0
// @include        https://www.discogs.com/seller/*/profile*
// @include        https://www.discogs.com/sell/list*
// @grant          none
// ==/UserScript==

// -- DEFAULTS -- //

// All items with rating lower than
// MIN_RATING will be filtered out
// when `Rating` filter is checked
const MIN_RATING = 4

// All items with want:have ratio lower than
// WANTED_RATIO will be filtered out
// when `Wanted` filter is checked
const WANTED_RATIO = 1

// All items with have quantity greater than
// RARITY_MAX_COUNT will be filtered out
// when `Rare` filter is checked
const RARITY_MAX_COUNT = 50

let items

function styleHelper(el, style = {}) {
  Object.assign(el.style, style)
}

// -- ELEMENTS -- //
// Filters Container
const filters = document.createElement('div')
filters.id = 'tm_customFilters'
styleHelper(filters, {
  display: 'inline-flex',
  alignItems: 'center',
  height: '100%',
  marginLeft: '16px'
})

// Filters Label
const filterLabel = document.createElement('span')
styleHelper(filterLabel, {
  borderWidth: '0 0 0 1px',
  borderColor: '#e5e5e5',
  borderStyle: 'solid',
  paddingLeft: '16px'
})

const nodeA = document.createTextNode('Filters (')

const allButton = document.createElement('button')
allButton.type = 'button'
allButton.textContent = 'All'
styleHelper(allButton, {
  padding: '0',
  border: 'none',
  background: 'none',
  appearance: 'none',
  color: '#4c8bda'
})

const nodeB = document.createTextNode(')')

// Rating Filter
const ratingWrapper = document.createElement('div')
styleHelper(ratingWrapper, {
  display: 'flex',
  alignItems: 'center',
  marginLeft: '16px'
})

const ratingInput = document.createElement('input')
ratingInput.type = 'checkbox'
ratingInput.id = 'tm_ratingFilter'

const ratingInputLabel = document.createElement('label')
ratingInputLabel.htmlFor = 'tm_ratingFilter'
ratingInputLabel.textContent = 'Rating'
styleHelper(ratingInputLabel, {
  padding: '0px',
  marginLeft: '4px'
})

// Wanted Filter
const wantedWrapper = document.createElement('div')
styleHelper(wantedWrapper, {
  display: 'flex',
  alignItems: 'center',
  marginLeft: '16px'
})

const wantedInput = document.createElement('input')
wantedInput.type = 'checkbox'
wantedInput.id = 'tm_wantedFilter'

const wantedInputLabel = document.createElement('label')
wantedInputLabel.htmlFor = 'tm_wantedFilter'
wantedInputLabel.textContent = 'Wanted'
styleHelper(wantedInputLabel, {
  padding: '0px',
  marginLeft: '4px'
})

// Rare Filter
const rareWrapper = document.createElement('div')
styleHelper(rareWrapper, {
  display: 'flex',
  alignItems: 'center',
  marginLeft: '16px'
})

const rareInput = document.createElement('input')
rareInput.type = 'checkbox'
rareInput.id = 'tm_rareFilter'

const rareInputLabel = document.createElement('label')
rareInputLabel.htmlFor = 'tm_rareFilter'
rareInputLabel.textContent = 'Rare'
styleHelper(rareInputLabel, {
  padding: '0px',
  marginLeft: '4px'
})

// -- EVENTS -- //
function inputHandler() {
  const filterByRating = ratingInput.checked
  const filterByWanted = wantedInput.checked
  const filterByRare = rareInput.checked

  items.forEach(({ el, haveCount, rating, wantCount }) => {
    let hidden = false

    if (filterByRating && rating < MIN_RATING) {
      hidden = true
    }

    if (filterByWanted && (wantCount / haveCount <= WANTED_RATIO)) {
      hidden = true
    }

    if (filterByRare && haveCount > RARITY_MAX_COUNT) {
      hidden = true
    }

    el.style.opacity = hidden ? '0.25' : null
    el.style.filter = hidden ? 'grayscale(1)' : null
    el.style.pointerEvents = hidden ? 'none' : null
    el.style.userSelect = hidden ? 'none' : null
  })

  allButton.textContent = filterByRating && filterByWanted && filterByRare
    ? 'None'
    : 'All'
}

function buildFilters() {
  const filterContainer = document.querySelector('.multiple_filters')
  styleHelper(filterContainer, {
    maxWidth: 'none'
  })

  filterLabel.appendChild(nodeA)
  filterLabel.appendChild(allButton)
  filterLabel.appendChild(nodeB)
  filters.appendChild(filterLabel)
  ratingWrapper.appendChild(ratingInput)
  ratingWrapper.appendChild(ratingInputLabel)
  wantedWrapper.appendChild(wantedInput)
  wantedWrapper.appendChild(wantedInputLabel)
  rareWrapper.appendChild(rareInput)
  rareWrapper.appendChild(rareInputLabel)
  filters.appendChild(ratingWrapper)
  filters.appendChild(wantedWrapper)
  filters.appendChild(rareWrapper)
  filterContainer.appendChild(filters)

  items = [...document.querySelectorAll('.mpitems tbody tr')].map((item) => {
    const rating = item.querySelector('.community_rating strong')
    const haveCount = item.querySelector('.have_indicator .community_number')
    const wantCount = item.querySelector('.want_indicator .community_number')

    let parsedRating = 0
    let parsedHaveCount = 1
    let parsedWantCount = 0

    if (rating) {
      parsedRating = parseFloat(rating.textContent, 10)
    }

    if (haveCount) {
      parsedHaveCount = parseInt(haveCount.textContent, 10)
    }

    if (wantCount) {
      parsedWantCount = parseInt(wantCount.textContent, 10)
    }

    return {
      el: item,
      haveCount: parsedHaveCount,
      rating: parsedRating,
      wantCount: parsedWantCount
    }
  })
}

ratingInput.addEventListener('change', inputHandler)
wantedInput.addEventListener('change', inputHandler)
rareInput.addEventListener('change', inputHandler)

allButton.addEventListener('click', () => {
  ratingInput.checked = wantedInput.checked = rareInput.checked = !(ratingInput.checked && wantedInput.checked && rareInput.checked)
  inputHandler()
})

// -- START -- //
window.setInterval(() => {
  if (!document.getElementById('tm_customFilters')) {
    buildFilters()
    inputHandler()
  }
}, 500)
