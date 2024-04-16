const gifFiles = ['bird1.gif', 'bird2.gif', 'bird3.gif'];
let birdPositions = [];
let deletedPods = []; // Store deleted pods to prevent immediate re-creation of birds

async function fetchPods() {
    const response = await fetch('/pods');
    const data = await response.json();
    const pods = data.pods;
    const birdsContainer = document.getElementById('birds-container');
    const noPodsMessage = document.getElementById('no-pods-message');
    
    if (birdsContainer) {
        if (pods.length === 0) {
            noPodsMessage.style.display = 'block';
        } else {
            noPodsMessage.style.display = 'none';
            const existingPods = Array.from(birdsContainer.querySelectorAll('.bird')).map(bird => bird.title);
            pods.forEach(pod => {
                if (!existingPods.includes(pod.name) && !deletedPods.includes(pod.name)) {
                    const bird = document.createElement('img');
                    const randomGif = gifFiles[Math.floor(Math.random() * gifFiles.length)];
                    const randomHueRotation = getRandomHueRotation(-180, 180); // Adjust hue rotation range
                    bird.src = `/static/birds/${randomGif}`; // Update the src path
                    bird.className = 'bird';
                    bird.style.filter = `hue-rotate(${randomHueRotation}deg)`; // Apply hue rotation
                    const position = getRandomPosition(1080, bird.clientHeight);
                    bird.style.top = `${position}px`;
                    bird.style.animationDuration = `${getRandomSpeed()}s`;
                    bird.title = pod.name;
                    bird.addEventListener('click', () => deletePod(pod.name));
                    
                    // Create tooltip element
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = pod.name; // Set tooltip content
                    bird.appendChild(tooltip); // Append tooltip to bird element
                    
                    birdsContainer.appendChild(bird);
                }
            });
        }
    }
}

function getRandomColor() {
    // Generate a random hexadecimal color code
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function getRandomPosition(maxDimension, birdDimension) {
    return Math.floor(Math.random() * (maxDimension - birdDimension));
}

async function deletePod(podName) {
    try {
        const response = await fetch(`/delete_pod/${podName}`, { method: 'DELETE' });
        if (response.ok) {
            console.log(`Pod ${podName} deleted successfully.`);
            showPopup(`Pod ${podName} is deleted.`);
            // Remove the bird element associated with the deleted pod
            const birdToRemove = document.querySelector(`[title="${podName}"]`);
            if (birdToRemove) {
                birdToRemove.remove();
            }
            deletedPods.push(podName); // Add deleted pod to prevent immediate re-creation
            setTimeout(() => {
                deletedPods = deletedPods.filter(pod => pod !== podName); // Remove from deletedPods after 3 seconds
                fetchPods(); // Fetch pods again after updating deletedPods
            }, 3000);
            if (document.querySelectorAll('.bird').length === 0) {
                const noPodsMessage = document.getElementById('no-pods-message');
                noPodsMessage.style.display = 'block';
            }
        } else {
            console.error(`Failed to delete pod ${podName}.`);
        }
    } catch (error) {
        console.error(`Error deleting pod ${podName}:`, error);
    }
}

function showPopup(message) {
    const popupText = document.getElementById('popupText');
    const overlay = document.getElementById('overlay');
    popupText.textContent = message;
    document.getElementById('popup').style.display = 'block';
    overlay.style.display = 'block';
    setTimeout(() => {
        document.getElementById('popup').style.display = 'none';
        overlay.style.display = 'none';
    }, 3000);
}

function getRandomSpeed() {
    return Math.random() * 10 + 10;
}

function getRandomHueRotation() {
    return Math.floor(Math.random() * 360);
}

fetchPods();
setInterval(fetchPods, 60000);
