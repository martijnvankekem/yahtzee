class YahtzeeLoader {
    /**
     * Constructor for Yahtzee Loader.
     */
    constructor() {
        this.activeGame = null;
    }

    /**
     * Restart the active game.
     */
    restart() {
        localStorage.removeItem("game_active");
    }

    /**
     * Start a new game.
     * @param game The game (optional).
     */
    createGame(game = null) {
        if (!game)
            game = new Yahtzee(this, document.getElementById("game"));

        this.activeGame = game;
    }

    /**
     * Start the active game.
     */
    newGame() {
        this.createGame();
        this.activeGame.prepareColumns();
    }

    /**
     * Whether a checkpoint exists.
     */
    hasCheckpoint() {
        return localStorage.getItem("game_active") !== null;
    }

    /**
     * Save a checkpoint of the current game.
     */
    saveCheckpoint() {
        if (!this.activeGame) return;

        const json = YahtzeeLoader.toArray(this.activeGame);
        localStorage.setItem("game_active", JSON.stringify(json));
    }

    /**
     * Load the checkpoint.
     */
    loadCheckpoint() {
        const json = localStorage.getItem("game_active");
        if (!json) return;

        const array = JSON.parse(json);
        this.createGame();
        this.activeGame.columns = array["ones"].length;
        this.activeGame.prepareColumns();

        YahtzeeLoader.fromArray(this.activeGame, array);
    }

    /**
     * Convert a Yahtzee game to an array.
     * @param game
     */
    static toArray(game) {
        const items = game.container.querySelectorAll(`tr[data-id] td[data-column]`);

        const saveArray = {};
        for (let item of items) {
            const id = item.parentElement.getAttribute("data-id");
            const column = Number(item.getAttribute("data-column"));
            if (!(id in saveArray)) saveArray[id] = [];

            saveArray[id][column] =
                item.querySelector(`select, input`).value;
        }

        return saveArray;
    }

    /**
     * Apply the array to a Yahtzee game.
     * @param game The game to update.
     * @param array The array with the data.
     */
    static fromArray(game, array) {
        for (let [key, value] of Object.entries(array)) {
            for (let col = 0; col < value.length; col++) {
                const element = game.container.querySelector(`tr[data-id="${key}"] td[data-column="${col}"]`);
                let inputEl = element.querySelector(`select, input`);
                inputEl.value = value[col];
                inputEl.dispatchEvent(new Event("change"));
            }
        }

        for (let i = 0; i < game.columns; i++)
            game.updateTotals(i);
    }
}