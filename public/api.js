class APIHandler {
    static async getConfig() {
        return await fetch("/get-config", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    static async useConfig(config) {
        localStorage.setItem("config", JSON.stringify(config));
        return await fetch("/use-config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
        });
    }
}