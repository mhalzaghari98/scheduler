//I am using a jquery library to read the json file, and then convert it into an object that I can use
var data;
$.ajax({
    type: "GET",  
    url: "./test.json",
    dataType: "json",       
    success: function(response)  
    {
        data = response
        var chosenMajor = "Computer Science"

        var majorObj = data["majors"][chosenMajor]
        for (const courseType in majorObj) {
            var currDiv = $("#" + courseType)
            if (currDiv.length == 0) {
                console.log("error: courseType '" + courseType + "' is an invalid div")
                continue
            }
            majorObj[courseType].forEach( function(item, index) {
                currDiv.append('<div class="list-item" draggable="true">' + item + '</div>')
            });
        }

        makeItemsDraggable();
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
                console.log('drop');
                this.append(draggedItem);
                this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            });
        }
    }
}