import dotenv from 'dotenv';
import InputToInput from './InputToInput';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/";

export default async function CallAndRecieveInput(frontendInput) {
    const neuralNetworkInput = InputToInput(frontendInput);
    try {
        const response = await fetch(`${BACKEND_URL}api/endpoint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(neuralNetworkInput),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

