

class Main {
    constructor() {
        this.config = null;

        /** @type {HTMLTextAreaElement} */
        this.systemContextInput = /** @type {any} */ (document.getElementById("system-context"));

        /** @type {HTMLButtonElement} */
        this.systemContextSaveButton = /** @type {any} */ (document.getElementById("system-context-save-btn"));

        /** @type {HTMLSelectElement} */
        this.channelSelect = /** @type {any} */ (document.getElementById("channel-select"));

        this.loadConfig().then(() => {
            this.setupUI();
            this.addEventListeners();
        });
    }

    setupUI() {
        const channels = Object.keys(this.config.channels);
        const selectedChannel = channels[0];

        this.channelSelect.innerHTML = channels.map((channel) => `<option value="${channel}">${channel}</option>`).join("");
        this.systemContextInput.value = this.config.channels[selectedChannel].aiSystemContext;
    }

    addEventListeners() {
        this.systemContextSaveButton.addEventListener("click", () => {
            APIHandler.useConfig(this.config);
        });

        this.systemContextInput.addEventListener("input", () => {
            this.config.channels[this.channelSelect.value].aiSystemContext = this.systemContextInput.value;
        });
    }

    async loadConfig() {
        const config = localStorage.getItem("config");
        if (config == null) {
            const response = await APIHandler.getConfig();
            if (!response.ok) {
                return;
            }

            this.config = await response.json();
        } else {
            this.config = JSON.parse(config);
            APIHandler.useConfig(this.config);
        }
    }
}

new Main();
