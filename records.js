//Fetch Data

async function getData() {
    const response = await fetch('/subscribers', {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
    })
    const data = response.json();

}

getData();