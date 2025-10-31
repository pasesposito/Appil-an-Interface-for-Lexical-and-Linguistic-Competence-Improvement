async function getWord(word) {
    try {
        const response = await fetch(`/api/noun/retrieve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({ word: word }) // Send word inside a JSON object
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read the error message
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json(); // Parse JSON response
        return data; // Return the entire data object
    } catch (error) {
        console.error('Error fetching word data:', error);
        return null; // Return null in case of error
    }
}



