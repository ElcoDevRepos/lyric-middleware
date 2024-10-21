async function getCityName(zipCode) {
    const apiKey = "AIzaSyCEMmNnlgzp6-Q6XtpE6RfWZNUtpCdU3ZY";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.status !== "OK") {
            throw new Error("Error with geocoding API: " + data.status);
        }

        const results = data.results;
        if (results.length === 0) {
            throw new Error("No results found");
        }

        const addressComponents = results[0].address_components;
        let cityComponent = addressComponents.find((component) =>
            component.types.includes("locality")
        );

        if (!cityComponent) {
            cityComponent = addressComponents.find((component) =>
            component.types.includes("neighborhood")
            );

            if (!cityComponent) {
            throw new Error("City not found in address components");
            }
        }

        return cityComponent.long_name;
    } catch (error) {
        console.error("Error fetching city name:", error);
        throw error;
    }
}

async function getAddressDetailsFromZip(zipCode) {
    const apiKey = "AIzaSyCEMmNnlgzp6-Q6XtpE6RfWZNUtpCdU3ZY";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.status !== "OK") {
            throw new Error("Error with geocoding API: " + data.status);
        }

        const results = data.results;
        if (results.length === 0) {
            throw new Error("No results found");
        }

        const addressComponents = results[0].address_components;
        return addressComponents;
    } catch (error) {
        console.error("Error fetching city name:", error);
        throw error;
    }
}


module.exports = {
    getCityName,
    getAddressDetailsFromZip
}