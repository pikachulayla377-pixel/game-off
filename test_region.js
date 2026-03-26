import fetch from "node-fetch";

const url = "http://localhost:8080/api/v1/check-region";

async function runTest() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: "391069103",
        server_id: "2415",
        game: "mlbb"
      }),
    });

    const data = await response.json();
    console.log("Local API Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Test Request Failed:", error);
  }
}

runTest();
