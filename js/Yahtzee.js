class Yahtzee {
    /**
     * Constructor for Yahtzee
     * @param loader The yahtzee loader.
     * @param container The container element
     */
    constructor(loader, container) {
        this.loader = loader;
        this.container = container;
        this.columns = 1;
    }

    /**
     * Add an extra column.
     */
    addColumn() {
        if (this.columns >= 3) return;

        this.columns++;
        this.prepareColumn(this.columns - 1);
        this.updateTotals(this.columns - 1);
        this.loader.saveCheckpoint();
    }

    /**
     * Prepare the columns in the table.
     */
    prepareColumns() {
        for (let i = 0; i < this.columns; i++) {
            this.prepareColumn(i);
            this.updateTotals(i);
        }
    }

    /**
     * Add a single column to the table.
     */
    prepareColumn(columnIndex) {
        // Do for every table row
        const rows = this.container.querySelectorAll("tr[data-type]");
        for (let row of rows) {
            // Add new column
            const column = document.createElement("td");
            column.setAttribute("data-column", columnIndex);


            // Create new element
            if (row.getAttribute("data-type") === "label") {
                column.append("0");
            } else {
                // Special input type.
                let inputEl;
                if (row.getAttribute("data-type") === "number") {
                    inputEl = Yahtzee.createNumberElement(row);
                } else if (row.getAttribute("data-type") === "select") {
                    inputEl = Yahtzee.createSelectElement(row);
                } else if (row.getAttribute("data-type") === "input") {
                    inputEl = Yahtzee.createInputElement(row);
                }

                inputEl.addEventListener("change",
                        e => this.inputValueChanged(e, columnIndex))
                column.append(inputEl);
            }

            // Add column to row.
            row.append(column);
        }
    }

    /**
     * When an input value has changed.
     * @param e
     * @param columnIndex
     */
    inputValueChanged(e, columnIndex) {
        this.updateTotals(columnIndex);
        this.loader.saveCheckpoint();

        e.target.parentElement.classList.toggle("filled", e.target.value !== "");
        e.target.parentElement.classList.toggle("zero", e.target.value === "0");
        e.target.blur();
    }

    /**
     * Update the totals for a given column.
     * @param columnIndex The column to update.
     */
    updateTotals(columnIndex) {
        this.updateColumnTotal("subtop", columnIndex);
        this.updateColumnBonus(columnIndex);
        this.updateColumnTotal("top", columnIndex);
        this.updateColumnTotal("bottom", columnIndex);
        this.updateColumnTotal("column", columnIndex);
        this.updateGrandTotal();
    }

    /**
     * Update the grand total
     */
    updateGrandTotal() {
        const elements = Array.from(this.container.querySelectorAll(
            `tr[data-value="total-column"] td[data-column]`));

        this.container.querySelector(`td[data-grand-total]`).innerText =
            elements.reduce((acc, element) => acc + Number(element.innerText), 0);
    }

    /**
     * Calculate the bonus for a given column.
     * @param columnIndex The column index.
     */
    updateColumnBonus(columnIndex) {
        const rows = this.container.querySelectorAll(
            `tr[data-type="number"] td[data-column="${columnIndex}"]`);

        let bonusDelta = 0;
        let columnSum = 0;
        for (let row of rows) {
            const number = Number(row.parentElement.getAttribute("data-value"));
            const valueEl = row.querySelector(`select`);
            if (valueEl.value === "")
                bonusDelta += 3 * number;
            else {
                bonusDelta += Number(valueEl.value);
                columnSum += Number(valueEl.value);
            }
        }

        const bonusValue = columnSum < 63 ? 0 : 35;
        let delta = -63 + bonusDelta;

        this.container.querySelector(`tr[data-type="label"][data-value="bonus"] td[data-column="${columnIndex}"]`)
            .innerText = bonusValue;
        let deltaCol = this.container.querySelector(`tr[data-type="label"][data-value="bonus-delta"] td[data-column="${columnIndex}"]`);
        deltaCol.innerText = `(${delta})`;
        deltaCol.classList.toggle("positive", delta >= 0);
        deltaCol.classList.toggle("negative", delta < 0);
    }

    /**
     * Update the total amount of points for a given column.
     * @param { "subtop" | "top" | "bottom" | "column" } type The type to update.
     * @param columnIndex The column index.
     */
    updateColumnTotal(type, columnIndex) {
        // Find all elements
        const elements = this.container.querySelectorAll(
            `tr[data-total-${type}] td[data-column="${columnIndex}"]`);

        // Sum values
        let total = 0;
        for (let element of elements) {
            const valueEl = element.querySelector(`select, input`);
            if (valueEl)
                total += Number(valueEl.value);
            else
                total += Number(element.innerText);
        }

        // Update label
        this.container.querySelectorAll(
            `tr[data-value="total-${type}"] td[data-column="${columnIndex}"]`)
            .forEach(element => element.innerText = total);
    }

    /**
     * Create a number element for the specified row.
     * @param row The row parent element
     */
    static createNumberElement(row) {
        const element = document.createElement("select");
        const number = Number(row.getAttribute("data-value"));

        // Add blank option
        element.appendChild(this.createOptionValue("", ""));

        // Add number options
        for (let i = 0; i <= number * 5; i += number) {
            element.appendChild(this.createOptionValue(i, i));
        }

        return element;
    }

    /**
     * Create a select element for the specified row.
     * @param row The row parent element
     */
    static createSelectElement(row) {
        const element = document.createElement("select");
        const number = Number(row.getAttribute("data-value"));

        // Add blank option
        element.appendChild(this.createOptionValue("", ""));

        // Add zero score option
        element.appendChild(this.createOptionValue(0, 0));

        // Add target score option
        element.appendChild(this.createOptionValue(number, number));

        return element;
    }

    /**
     * Create an input element for the specified row.
     * @param row The row parent element
     */
    static createInputElement(row) {
        const element = document.createElement("input");
        element.type = "text";
        element.pattern = "\\d*";
        element.placeholder = " ";
        element.inputMode = "decimal";
        element.min = row.getAttribute("data-min");
        element.max = row.getAttribute("data-max");

        element.addEventListener("keydown",
                e => this.validateKeyDown(e));

        return element;
    }

    /**
     * Create an option value element
     * @param name The id of the option.
     * @param value The value to show the user.
     * @returns {HTMLOptionElement}
     */
    static createOptionValue(name, value) {
        const option = document.createElement("option");
        option.value = value;
        option.innerText = name;
        return option;
    }

    /**
     * Validate a key down event in an input.
     * @param e The event that fired.
     */
    static validateKeyDown(e) {
        const currentValue = e.target.value;
        const newValue = Number(currentValue + e.key);

        if (newValue < e.target.min || newValue > e.target.max) {
            e.preventDefault();
        }
    }
}