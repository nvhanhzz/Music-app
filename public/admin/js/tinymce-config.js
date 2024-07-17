tinymce.init({
    selector: 'textarea#my-expressjs-tinymce-app',
    plugins: 'image code',
    toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image',
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    images_upload_url: "/admin/upload", // api upload
});
