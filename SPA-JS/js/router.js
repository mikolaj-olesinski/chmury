let pageUrls = {
    about: '/index.html?about',
    contact: '/index.html?contact',
    gallery: '/index.html?gallery'
};

function OnStartUp() {
    popStateHandler();
}

OnStartUp();

document.querySelector('#about-link').addEventListener('click', (event) => {
    let stateObj = { page: 'about' };
    document.title = 'About';
    history.pushState(stateObj, "about", "?about");
    RenderAboutPage();
});

document.querySelector('#contact-link').addEventListener('click', (event) => {
    let stateObj = { page: 'contact' };
    document.title = 'Contact';
    history.pushState(stateObj, "contact", "?contact");
    RenderContactPage();
});

document.querySelector('#gallery-link').addEventListener('click', (event) => {
    let stateObj = { page: 'gallery' };
    document.title = 'Gallery';
    history.pushState(stateObj, "gallery", "?gallery");
    RenderGalleryPage();
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

function RenderAboutPage() {
    document.querySelector('main').innerHTML = `
        <h1 class="title">About Me</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor neque nec enim commodo, at blandit tortor maximus. Sed non risus in elit molestie commodo. Suspendisse potenti. Suspendisse vitae quam eget mauris sagittis pharetra.</p>
        <p>Cras auctor eleifend augue, vel tempor dolor imperdiet vel. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec quis nunc vitae dolor iaculis auctor. Suspendisse potenti.</p>
    `;
}

function RenderContactPage() {
    document.querySelector('main').innerHTML = `
        <h1 class="title">Contact with me</h1>
        <form id="contact-form">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <span class="error-message" id="name-error"></span>
            
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            <span class="error-message" id="email-error"></span>
            
            <label for="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
            <span class="error-message" id="message-error"></span>
            
            <div class="g-recaptcha" data-sitekey="your-recaptcha-site-key"></div>
            <span class="error-message" id="recaptcha-error"></span>
            
            <button type="submit">Send</button>
        </form>
    `;
    
    document.getElementById('contact-form').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Form validation
        let valid = true;
        
        const name = document.getElementById('name').value.trim();
        if (name === '') {
            document.getElementById('name-error').textContent = 'Name is required';
            valid = false;
        }
        
        const email = document.getElementById('email').value.trim();
        if (email === '') {
            document.getElementById('email-error').textContent = 'Email is required';
            valid = false;
        } else if (!validateEmail(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            valid = false;
        }
        
        const message = document.getElementById('message').value.trim();
        if (message === '') {
            document.getElementById('message-error').textContent = 'Message is required';
            valid = false;
        }
        
        // reCAPTCHA validation
        const recaptchaResponse = grecaptcha.getResponse();
        if (recaptchaResponse.length === 0) {
            document.getElementById('recaptcha-error').textContent = 'Please complete the reCAPTCHA';
            valid = false;
        }
        
        if (valid) {
            alert('Form submitted successfully!');
            // Here you would typically send the form data to your server
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function RenderGalleryPage() {
    document.querySelector('main').innerHTML = `
        <h1 class="title">Gallery</h1>
        <div class="gallery-container" id="gallery-container">
            <!-- Gallery items will be loaded here dynamically -->
        </div>
        <div class="modal" id="image-modal">
            <span class="close-button" id="close-modal">&times;</span>
            <div class="modal-content">
                <img class="modal-image" id="modal-image" src="" alt="Gallery image large view">
            </div>
        </div>
    `;
    
    // Mock image data (in a real app, you might fetch this from an API)
    const images = [
        { id: 1, url: "https://via.placeholder.com/300x200?text=Image+1" },
        { id: 2, url: "https://via.placeholder.com/300x200?text=Image+2" },
        { id: 3, url: "https://via.placeholder.com/300x200?text=Image+3" },
        { id: 4, url: "https://via.placeholder.com/300x200?text=Image+4" },
        { id: 5, url: "https://via.placeholder.com/300x200?text=Image+5" },
        { id: 6, url: "https://via.placeholder.com/300x200?text=Image+6" },
        { id: 7, url: "https://via.placeholder.com/300x200?text=Image+7" },
        { id: 8, url: "https://via.placeholder.com/300x200?text=Image+8" },
        { id: 9, url: "https://via.placeholder.com/300x200?text=Image+9" }
    ];
    
    const galleryContainer = document.getElementById('gallery-container');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');
    
    // Load gallery images with lazy loading
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.className = 'gallery-image';
        img.dataset.src = image.url;
        img.alt = `Gallery image ${image.id}`;
        
        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);
        
        // Open modal when clicking on an image
        galleryItem.addEventListener('click', () => {
            modalImage.src = image.url;
            modal.style.display = 'flex';
        });
    });
    
    // Close modal when clicking on close button or outside the image
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Implement lazy loading
    const lazyLoad = () => {
        const lazyImages = document.querySelectorAll('.gallery-image[data-src]');
        
        lazyImages.forEach(img => {
            if (isElementInViewport(img)) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    };
    
    // Check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Run lazy loading on initial load
    lazyLoad();
    
    // Add scroll event for lazy loading
    window.addEventListener('scroll', lazyLoad);
    window.addEventListener('resize', lazyLoad);
}

function popStateHandler() {
    let loc = window.location.href.toString().split(window.location.host)[1];
    if (loc === pageUrls.contact) { RenderContactPage(); }
    else if (loc === pageUrls.about) { RenderAboutPage(); }
    else if (loc === pageUrls.gallery) { RenderGalleryPage(); }
}

window.onpopstate = popStateHandler;