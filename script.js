document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const themeBtn = document.getElementById('themeBtn');
    const wordToPdfBtn = document.getElementById('wordToPdfBtn');
    const pdfToWordBtn = document.getElementById('pdfToWordBtn');
    const dropZone = document.getElementById('dropZone');
    const dropZoneTitle = document.getElementById('dropZoneTitle');
    const fileInput = document.getElementById('fileInput');
    const previewContent = document.getElementById('previewContent');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Variables de estado
    let isDarkMode = true;
    let currentConversion = 'wordToPdf'; // 'wordToPdf' o 'pdfToWord'
    let selectedFile = null;
    let convertedFile = null;

    // Inicializar la aplicación
    init();

    function init() {
        setupThemeToggle();
        setupConversionToggle();
        setupDragAndDrop();
        setupFileInput();
        setupConvertButton();
        setupDownloadButton();
    }

    // Cambiar entre modo claro/oscuro
    function setupThemeToggle() {
        themeBtn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('light-mode', !isDarkMode);
            document.body.classList.toggle('dark-mode', isDarkMode);
            themeBtn.innerHTML = isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // Cambiar entre Word → PDF y PDF → Word
    function setupConversionToggle() {
        wordToPdfBtn.addEventListener('click', () => {
            currentConversion = 'wordToPdf';
            wordToPdfBtn.classList.add('active');
            pdfToWordBtn.classList.remove('active');
            dropZoneTitle.textContent = 'Arrastra tu archivo Word aquí';
            resetConverter();
        });

        pdfToWordBtn.addEventListener('click', () => {
            currentConversion = 'pdfToWord';
            pdfToWordBtn.classList.add('active');
            wordToPdfBtn.classList.remove('active');
            dropZoneTitle.textContent = 'Arrastra tu archivo PDF aquí';
            resetConverter();
        });
    }

    // Configurar zona de arrastrar y soltar
    function setupDragAndDrop() {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('highlight');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('highlight');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('highlight');

            if (e.dataTransfer.files.length) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Configurar input de archivo
    function setupFileInput() {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                handleFileSelection(fileInput.files[0]);
            }
        });
    }

    // Procesar archivo seleccionado
    function handleFileSelection(file) {
        const validExtensions = currentConversion === 'wordToPdf' 
            ? ['.docx'] 
            : ['.pdf'];

        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(`.${fileExt}`)) {
            alert(`Por favor, selecciona un archivo ${validExtensions.join(' o ')}`);
            return;
        }

        selectedFile = file;
        convertBtn.disabled = false;
        showFilePreview(file);
    }

    // Mostrar vista previa del archivo
    function showFilePreview(file) {
        const reader = new FileReader();

        if (currentConversion === 'wordToPdf') {
            reader.onload = (e) => {
                previewContent.innerHTML = '<p>Vista previa no disponible para DOCX. Convierte a PDF para ver.</p>';
            };
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = (e) => {
                previewContent.innerHTML = '<p>Vista previa no disponible para PDF. Convierte a Word para editar.</p>';
            };
            reader.readAsText(file);
        }
    }

    // Configurar botón de conversión
    function setupConvertButton() {
        convertBtn.addEventListener('click', async () => {
            if (!selectedFile) return;

            convertBtn.disabled = true;
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convirtiendo...';

            try {
                if (currentConversion === 'wordToPdf') {
                    convertedFile = await convertWordToPdf(selectedFile);
                } else {
                    convertedFile = await convertPdfToWord(selectedFile);
                }

                downloadBtn.disabled = false;
                previewContent.innerHTML = '<p>¡Conversión exitosa! Haz clic en "Descargar".</p>';
            } catch (error) {
                console.error("Error en la conversión:", error);
                previewContent.innerHTML = '<p style="color: #ff7675;">Error en la conversión. Intenta con otro archivo.</p>';
            } finally {
                convertBtn.disabled = false;
                convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convertir';
            }
        });
    }

    // Convertir Word a PDF (usando pdf-lib)
    async function convertWordToPdf(file) {
        // Nota: En un entorno real, usarías una librería como pdf-lib o un backend
        // Esta es una simulación
        return new Blob([file], { type: 'application/pdf' });
    }

    // Convertir PDF a Word (usando mammoth.js)
    async function convertPdfToWord(file) {
        // Nota: mammoth.js es para DOCX → HTML, pero aquí simulamos la conversión
        return new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }

    // Configurar botón de descarga
    function setupDownloadButton() {
        downloadBtn.addEventListener('click', () => {
            if (!convertedFile) return;

            const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
            const extension = currentConversion === 'wordToPdf' ? '.pdf' : '.docx';
            const downloadUrl = URL.createObjectURL(convertedFile);

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${fileName}_convertido${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        });
    }

    // Reiniciar el conversor
    function resetConverter() {
        selectedFile = null;
        convertedFile = null;
        convertBtn.disabled = true;
        downloadBtn.disabled = true;
        previewContent.innerHTML = '<p class="placeholder">No hay archivo cargado.</p>';
    }
});