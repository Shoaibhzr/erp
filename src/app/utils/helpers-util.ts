export class Helpers {
    /**
     * Converts seconds to a minutes and seconds string (e.g., "2m 30s")
     */
    static convertSecondsToMinutes(seconds: number): string {
        if (isNaN(seconds) || seconds < 0) return '00:00'; // Handle invalid input

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    static downloadFile(url: string, fileName: string) {
        fetch(url, { mode: 'cors' }) // Ensure CORS is allowed
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl); // Clean up
            })
            .catch(error => console.error('Download error:', error));
    }
}