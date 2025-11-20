import InputToInput from "./InputToInput";

const BACKEND_URL = "http://localhost:5001/";

export default async function CallAndRecieveInput(
  frontendInput: Record<string, number>
) {
  console.log("CallAndRecieveInput - Input received:", frontendInput);
  const neuralNetworkInput = InputToInput(frontendInput);
  console.log(
    "CallAndRecieveInput - Converted to neural network input:",
    neuralNetworkInput
  );

  try {
    const response = await fetch(`${BACKEND_URL}api/endpoint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(neuralNetworkInput),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("CallAndRecieveInput - Response from backend:", data);
    return data;
  } catch (error) {
    console.error("Error calling API:", error);
    throw error;
  }
}

