async function logout() {
    // Get the CSRF token from the meta tag
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                [csrfHeader]: csrfToken // Add the CSRF token to the request headers
            },
            credentials: 'include' // Include cookies (if needed)
        });

        if (response.ok) {
            window.location.href = '@{/login?logout}'; // Redirect after successful logout
        } else {
            console.error('Logout failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Modal Image Gallery
function onClick(element) {
  document.getElementById("img01").src = element.src;
  document.getElementById("modal01").style.display = "block";
  var captionText = document.getElementById("caption");
  captionText.innerHTML = element.alt;
}



// Toggle between showing and hiding the sidebar when clicking the menu icon
var mySidebar = document.getElementById("mySidebar");

function w3_open() {
  if (mySidebar.style.display === 'block') {
    mySidebar.style.display = 'none';
  } else {
    mySidebar.style.display = 'block';
  }
}

// Close the sidebar with the close button
function w3_close() {
    mySidebar.style.display = "none";
}



function scrollUp() {
      window.scrollBy({
          top: -100, // Adjust the scroll value as needed
          behavior: 'smooth'
      });
  }

  function scrollDown() {
      window.scrollBy({
          top: 100, // Adjust the scroll value as needed
          behavior: 'smooth'
      });
  }
  
  
  function addPointsToUser(points) {
      fetch(`/api/points/add/${points}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              [csrfHeader]: csrfToken // Set CSRF token header
          },
          credentials: 'include'
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json(); // Parse the response as JSON
      })
      .then(data => {        
  		showNotification(points + ' points successfully added.');
      })
      .catch(error => {
          
      });
  }

  function addPointsToUserMessage(points, boolean) {
	
	if(boolean) {
        fetch(`/api/points/add/${points}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken // Set CSRF token header
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {        
    		showNotification("Correct! " + points + ' points successfully added.');
        })
        .catch(error => {
            
        });
		}
		
		else {
			
			showErrorNotification("Wrong Answer!");
			
		}
    }

  
  // Function to show a notification with a fade-out effect
  function showNotification(message) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.classList.add('show');
      
      // Hide the notification after 3 seconds
      setTimeout(() => {
          notification.classList.remove('show');
      }, 3000); // Adjust the duration as needed
  }
  
  // Function to show a notification with a fade-out effect
  function showErrorNotification(message) {
	
      const notification = document.getElementById('errorNotification');	  
      notification.textContent = message;
      notification.classList.add('show');
	 
      
      // Hide the notification after 3 seconds
      setTimeout(() => {
          notification.classList.remove('show');
      }, 3000); // Adjust the duration as needed
  }
  
  
  function readSection(sectionId) {
  			const section = document.getElementById(sectionId);
  			if (section) {
  				const text = section.innerText || section.textContent;
  				if (text) {
  					pronounceWord(text);
  				} else {
  					console.error("No text found in the section.");
  				}
  			} else {
  				console.error("Section not found.");
  			}
  		}
  
  
		document.addEventListener('DOMContentLoaded', () => {
		    
		    const modal = document.getElementById('instructionModal');
		    const closeModal = document.querySelector('.close');

		    // Get the current URL
		    const currentUrl = window.location.href;

		    // Define the home page URL (make sure this points to your actual home page)
		    const homePageUrl = window.location.origin + '/home'; // Adjust as needed

		    // Check if the modal element exists before interacting with it
		    if (modal) {
		        // Only show the modal if we are NOT on the home page
		        if (currentUrl !== homePageUrl) {
		            modal.style.display = 'block'; // Show the modal when the condition is met
		        }

		        const btn = document.getElementById('showInstructions');

		        if (btn) {
		            btn.onclick = function() {
		                modal.style.display = 'block'; // Show the modal when the button is clicked
		            };
		        }

		        // Close the modal when the user clicks the close button
		        if (closeModal) {
		            closeModal.addEventListener('click', () => {
		                modal.style.display = 'none';
		            });
		        }

		        // Close the modal when the user clicks anywhere outside the modal
		        window.addEventListener('click', (event) => {
		            if (event.target === modal) {
		                modal.style.display = 'none';
		            }
		        });
		    } else {
		        console.warn('Modal element not found.');
		    }
		});

	