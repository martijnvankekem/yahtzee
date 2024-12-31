let loader;
let zoomLevel = 1;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js').then();
}

/**
 * When the page has loaded.
 */
window.onload = () => {
    loadZoomLevel();
    registerHandlers();
    loader = new YahtzeeLoader();
    if (loader.hasCheckpoint()) {
        loader.loadCheckpoint();
    } else {
        loader.newGame();
    }
}

/**
 * Register event handlers
 */
function registerHandlers() {
    document.getElementById("button_addColumn").addEventListener("click",
        () => loader.activeGame.addColumn());

    document.getElementById("button_restart").addEventListener("click",
        () => onRestartClick());

    document.getElementById("button_zoomIn").addEventListener("click",
        () => updateZoom(0.1));

    document.getElementById("button_zoomOut").addEventListener("click",
        () => updateZoom(-0.1));
}

/**
 * When the restart button has been clicked.
 */
function onRestartClick() {
    if (confirm('Are you sure you want to restart the game? All data will be permanently lost!')) {
        loader.restart();
        window.location.reload();
    }
}

/**
 * Update the zoom level
 * @param increment The increment.
 */
function updateZoom(increment) {
    zoomLevel += increment;
    document.body.style.zoom = zoomLevel;
    localStorage.setItem("zoomLevel", zoomLevel);
}

/**
 * Load the zoom level from local storage.
 */
function loadZoomLevel() {
    zoomLevel = Number(localStorage.getItem("zoomLevel") ?? "1");
    document.body.style.zoom = zoomLevel;
}