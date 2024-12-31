let loader;
let zoomLevel = 1;

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
function minZoom() {
    zoomLevel -= 0.1;
    document.body.style.zoom = zoomLevel;
}

function plusZoom() {
    zoomLevel += 0.1;
    document.body.style.zoom = zoomLevel;
}
