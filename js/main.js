let loader;
let zoomLevel = 1;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js').then();
}

/**
 * When the page has loaded.
 */
window.onload = () => {
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
        () => zoomIn());

    document.getElementById("button_zoomOut").addEventListener("click",
        () => zoomOut());
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
 * Decrease the zoom level.
 */
function zoomOut() {
    zoomLevel -= 0.1;
    document.body.style.zoom = zoomLevel;
}

function zoomIn() {
    zoomLevel += 0.1;
    document.body.style.zoom = zoomLevel;
}
