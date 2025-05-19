// File sharing functionality
class FileSharing {
    constructor() {
        this.storage = firebase.storage();
        this.currentFile = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File attachment button
        document.getElementById('attachFile').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // Image attachment button
        document.getElementById('attachImage').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Image input change
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleImageSelect(e.target.files[0]);
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            this.closeFilePreview();
        });

        // Send file button
        document.getElementById('sendFile').addEventListener('click', () => {
            this.sendFile();
        });
    }

    async handleImageSelect(file) {
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Check file size (max 5MB for images)
        if (file.size > 5 * 1024 * 1024) {
            // Try to compress the image
            try {
                const compressedFile = await this.compressImage(file);
                this.currentFile = compressedFile;
                this.showFilePreview(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                alert('Image is too large. Please select a smaller image.');
                return;
            }
        } else {
            this.currentFile = file;
            this.showFilePreview(file);
        }
    }

    async handleFileSelect(file) {
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        this.currentFile = file;
        this.showFilePreview(file);
    }

    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions while maintaining aspect ratio
                    const maxDimension = 1200;
                    if (width > height && width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with quality 0.7
                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    showFilePreview(file) {
        const modal = document.getElementById('filePreviewModal');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const previewContent = document.getElementById('filePreviewContent');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        // Show preview based on file type
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';
            previewContent.innerHTML = '';
            previewContent.appendChild(img);
        } else {
            previewContent.innerHTML = `<i class="fas fa-file fa-3x"></i>`;
        }

        modal.style.display = 'block';
    }

    closeFilePreview() {
        const modal = document.getElementById('filePreviewModal');
        modal.style.display = 'none';
        this.currentFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('imageInput').value = '';
    }

    async sendFile() {
        if (!this.currentFile) return;

        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('User not authenticated');

            // Create a unique file name
            const timestamp = Date.now();
            const fileName = `${user.uid}_${timestamp}_${this.currentFile.name}`;
            const filePath = this.currentFile.type.startsWith('image/') 
                ? `medical_files/images/${fileName}`
                : `medical_files/documents/${fileName}`;

            // Upload file to Firebase Storage
            const fileRef = this.storage.ref().child(filePath);
            const uploadTask = await fileRef.put(this.currentFile);

            // Get download URL
            const downloadURL = await uploadTask.ref.getDownloadURL();

            // Create message object
            const message = {
                type: this.currentFile.type.startsWith('image/') ? 'image' : 'file',
                fileName: this.currentFile.name,
                fileSize: this.currentFile.size,
                fileType: this.currentFile.type,
                downloadURL: downloadURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                senderId: user.uid,
                senderName: user.displayName || user.email
            };

            // Add message to Firestore
            await this.addMessageToChat(message);

            // Close preview and reset
            this.closeFilePreview();
        } catch (error) {
            console.error('Error sending file:', error);
            alert('Error sending file. Please try again.');
        }
    }

    async addMessageToChat(message) {
        const chatId = this.getCurrentChatId();
        const chatRef = firebase.firestore().collection('chats').doc(chatId);
        
        await chatRef.collection('messages').add(message);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getCurrentChatId() {
        return document.querySelector('.chat-panel').dataset.chatId;
    }
}

// Initialize file sharing when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        debug('Initializing FileSharing...');
        window.fileSharing = new FileSharing();
        debug('FileSharing initialized successfully');
    } catch (error) {
        console.error('Error initializing FileSharing:', error);
        debug(`Error initializing FileSharing: ${error.message}`);
    }
});

// Add debug function if not already defined
if (typeof debug !== 'function') {
    function debug(message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[DEBUG][${timestamp}] ${message}`;
        console.log(logMessage);
        if (data) {
            console.log('Data:', data);
        }
    }
} 