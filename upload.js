function readFile(input) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const htmlPreview =
      '<img id="img-preview" width="200" src="' +
      e.target.result +
      '" />' +
      "<p>" +
      input.name +
      "</p>";
    const wrapperZone = $('.dropzone-wrapper');
    const previewZone = $(".preview-zone");
    const boxZone = $(previewZone).find(".box").find(".box-body");

    wrapperZone.removeClass("dragover");
    previewZone.removeClass("hidden");
    boxZone.empty();
    boxZone.append(htmlPreview);
  };

  reader.readAsDataURL(input);
}

function reset(e) {
  e.wrap("<form>").closest("form").get(0).reset();
  e.unwrap();
}

$(".dropzone").change(function () {
  if (this.files && this.files[0]) readFile(this.files[0]);
});

$(".dropzone-wrapper").on("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).addClass("dragover");
});

$(".dropzone-wrapper").on("dragleave", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(this).removeClass("dragover");
});

$("#paste-image").on("paste", function (e) {
  const clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
  if (clipboardData == null) return;

  const items = clipboardData.items;
  if (items == null) return;
  for (let i = 0; i < items.length; i++) {
    // Skip content if not image
    if (items[i].type.indexOf("image") == -1) continue;
    // Retrieve image on clipboard as blob
    const blob = items[i].getAsFile();
    readFile(blob);
    return;
  }
});