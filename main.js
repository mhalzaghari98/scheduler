var data;
//I am using a jquery library to read the json file, and then convert it into an object that I can use
$.ajax({
    type: "GET",  
    url: "./test.json",
    dataType: "json",       
    success: function(response)  
    {
        data = response
        // Populate the major list dropdown
        var majorDropdown = $("#major-dropdown")
        for (const major in data["majors"]) {
            console.log(major)
            majorDropdown.append("<option value='" + major + "'>" + major + "</option>")
        }
    }   
});

//Code snippet that allows the list items to be dragged into different boxes. 
//I pulled it from this Youtube video: https://www.youtube.com/watch?v=tZ45HZAkbLc

function makeItemsDraggable() {

    const list_items = document.querySelectorAll('.list-item');
    const lists = document.querySelectorAll('.list');

    let draggedItem = null;

    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];

        item.addEventListener('dragstart', function () {
            draggedItem = item;
            setTimeout(function () {
                item.style.display = 'none';
            }, 0)
        });

        item.addEventListener('dragend', function () {
            setTimeout(function () {
                draggedItem.style.display = 'block';
                draggedItem = null;
            }, 0);
        })
        for (let j = 0; j < lists.length; j ++) {
            const list = lists[j];

            list.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            list.addEventListener('dragenter', function (e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            });

            list.addEventListener('dragleave', function (e) {
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            });

            list.addEventListener('drop', function (e) {
                // This is a workaround for drop. For some reason, draggedItem includes 'null' items from previous major selection
                console.log("drop")
                if (draggedItem != null) {
                    this.append(draggedItem);
                }
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            });
        }
    }
}

$("#major-dropdown").change(function() {
    var chosenMajor = $("#major-dropdown option:selected").text()
    console.log(chosenMajor)

    // Clear and reformat every list
    $(".list").empty()
    $(".list").css("background-color", "rgba(253, 253, 253, 100)")
    $(".list-item").remove()

    // Basically when chosenMajor == None 
    if (!(chosenMajor in data["majors"])) {
        return
    }

    var majorObj = data["majors"][chosenMajor]
    for (const courseType in majorObj) {
        var currDiv = $("#" + courseType)
        if (currDiv.length == 0) {
            console.log("error: courseType '" + courseType + "' is an invalid div")
            continue
        }
        str = ""
        majorObj[courseType].forEach( function(item, index) {
            str += '<div class="list-item" draggable="true">' + item + '</div>'
        });
        currDiv.html(str)
    }

    makeItemsDraggable();
})