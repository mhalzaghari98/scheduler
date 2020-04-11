var data = {}
var draggedItem = null
var clickedItem = null

$(document).ready(function() {
    //Read the json file, and then convert it into an object
    $.ajax({
        type: "GET",  
        url: "./test.json",
        dataType: "json",       
        success: function(response)  {
            data = response
    
            var defaultMajor = ""
            // Populate the major list dropdown
            for (const major in data["majors"]) {
                if (defaultMajor === "") {
                    defaultMajor = major
                }
                $("#major-dropdown").append("<option value='" + major + "'>" + major + "</option>")
            }
    
            if (localStorage["lastDropdown"]) {
                defaultMajor = localStorage["lastDropdown"]
            }
    
            $("#major-dropdown").val(defaultMajor).change()
        }   
    });

    $("#major-dropdown").change(function() {
        var chosenMajor = $("#major-dropdown option:selected").text()
    
        updateLists(chosenMajor)
        saveLists()
        localStorage["lastDropdown"] = chosenMajor
    });

    $("#refresh").click(function() {
        refreshLists()
    });

    $("#export").click(function() {
        downloadJSON()
    });

    $("#image").click(function() {
        saveImage()
    });

    document.getElementById('file').addEventListener('change', readFile, false);

    makeListsDroppable();

    $(document).click(function(e) {
        if ( $(e.target).closest('.list').length === 0 ) {
            // cancel highlighting 
            if (clickedItem != null) {
                removeClickFromLists()
                $(clickedItem).removeClass('clicked')
                clickedItem = null
            }
        }
    });
});
    
function makeListsDroppable() {
    var lists = $('.list');

    for (let j = 0; j < lists.length; j ++) {
        const list = lists[j];

        list.addEventListener('dragover', function (e) {
            e.preventDefault();
            // this.style.backgroundColor = 'rgba(238, 238, 238, 1)';
            var courseType = $(draggedItem).attr("id").split("+")[0]
            if ($(this).parent().hasClass("schedule-lists") || $(this).attr("id") == courseType) {
                $(this).attr("drop-active", true)
            } else {
                $(this).attr("drop-active", false)
            }
        });

        list.addEventListener('dragenter', function (e) {
            e.preventDefault();
        });

        list.addEventListener('dragleave', function (e) {
            $(this).removeAttr("drop-active")
        });

        list.addEventListener('drop', function (e) {
            // console.log("drop")
            var courseType = $(draggedItem).attr("id").split("+")[0]
            if ($(this).parent().hasClass("schedule-lists") || $(this).attr("id") == courseType && 
                $(draggedItem).parent().attr('id') != $(this).attr('id')) {
                // console.log("appended item to lower div")
                this.append(draggedItem);
                saveLists()
            }
            $(this).removeAttr("drop-active")
        });

        list.addEventListener('click', function(e) {
            if (clickedItem != null) {
                if ($(this).attr("click-active") == "true") {
                    this.append(clickedItem)
                }
                $(clickedItem).removeClass('clicked')
                $(this).removeAttr("click-active")
                clickedItem = null;
                removeClickFromLists()
                saveLists()
            }
        })
    }
}

function removeClickFromLists() {
    var lists = $('.list');
    for (let j = 0; j < lists.length; j ++) {
        let list = lists[j]
        $(list).removeAttr("click-active")
    }
}

//Code snippet that allows the list items to be dragged into different boxes. 
//I pulled it from this Youtube video: https://www.youtube.com/watch?v=tZ45HZAkbLc

function makeItemsDraggable() {
    var list_items = $('.list-item');
    
    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];

        item.addEventListener('dragstart', function () {
            if (clickedItem != null) {
                removeClickFromLists()
                $(clickedItem).removeClass('clicked')
                clickedItem = null
            }
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
    }
}

function makeItemsClickable() {
    var list_items = $('.list-item');
    
    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];

        item.addEventListener('click', function (e) {
            if (clickedItem != null) {
                $(clickedItem).removeClass('clicked')
                if (clickedItem == item || $(item).parent().attr("click-active") == "false") {
                    console.log("here")
                    clickedItem = null
                    removeClickFromLists()
                    return
                }
                if ($(item).parent().attr("click-active") == "true") {
                    return
                }
            }
            e.stopPropagation()
            clickedItem = item;
            $(clickedItem).addClass('list-item clicked')
            var parentList = $(clickedItem).parent()

            removeClickFromLists()
            var lists = $('.list');
            for (let j = 0; j < lists.length; j ++) {
                const list = lists[j]
                var courseType = $(clickedItem).attr("id").split("+")[0]
                if ($(list).attr('id') != parentList.attr('id')) {
                    if ($(list).parent().hasClass("schedule-lists") || $(list).attr("id") == courseType) {
                        $(list).attr('click-active', true)
                    } else {
                        $(list).attr('click-active', false)
                    }
                }
            }
        });
    }
}

function clearLists() {
    $(".list").empty()
    $(".list").removeAttr("click-active")
    $(".list-item").remove()
}

function saveLists() {
    var listObj = {}
    listObj["lists"] = {}
    $('.list').each(function() {
        var key = $(this).attr('id')
        var courses = []
        $(this).children().each(function () {
            courses.push($(this).attr('id'))
        });
        listObj["lists"][key] = courses
    });
    var dropdownValue = $("#major-dropdown option:selected").text()
    listObj["major"] = dropdownValue
    // console.log(listObj)
    localStorage[dropdownValue] = JSON.stringify(listObj)
}
    
function loadLists(dropdownValue) {
    if (localStorage[dropdownValue]) {
        var listJSON = localStorage[dropdownValue]
        loadListsFromJSON(listJSON)
    }
}

function loadListsFromJSON(jsonString) {
    var listObj = JSON.parse(jsonString)
    // console.log(listObj)
    for (const listID in listObj["lists"]) {
        var div = $("#" + listID)
        var courses = listObj["lists"][listID]
        var str = ""
        courses.forEach( function(item, index) {
            var courseName = item.split("+")[1]
            str += '<div class="list-item" draggable="true" id="'+item+'">'+courseName+'</div>'
        })
        div.html(str)
    }
    makeItemsDraggable()
    makeItemsClickable()
}
    
function updateLists(major) {
    // Clear and reformat every list
    clearLists()

    // Check for cached lists
    if (localStorage[major]) {
        loadLists(major)
        return
    }

    // Basically when chosenMajor == None 
    if (!(major in data["majors"])) {
        return
    }

    var majorObj = data["majors"][major]
    for (const courseType in majorObj) {
        var currDiv = $("#" + courseType)
        if (currDiv.length == 0) {
            // console.log("error: courseType '" + courseType + "' is an invalid div")
            continue
        }
        var str = ""
        majorObj[courseType].forEach( function(item, index) {
            str += '<div class="list-item" draggable="true" id="'+courseType+'+'+item+'">'+item+'</div>'
        });
        currDiv.html(str)
    }

    makeItemsDraggable();
    makeItemsClickable();
}
    
function refreshLists() {
    var chosenMajor = $("#major-dropdown option:selected").text()

    localStorage.clear()
    updateLists(chosenMajor)
}

function downloadJSON() {
    var dropdownValue = $("#major-dropdown option:selected").text()
    if (localStorage[dropdownValue]) {
        jsonData = localStorage[dropdownValue]
        var data = "text/json;charset=utf-8," + encodeURIComponent(jsonData);
        // console.log(data)
        var a = document.createElement('a')
        a.href = "data:" + data;
        a.download = "schedule.sch"
        var container = document.getElementById("app")
        container.appendChild(a)
        a.click()
        container.removeChild(a)
    }
}

function readFile (evt) {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
      // console.log(event.target.result);
      clearLists()
      var listObj = JSON.parse(event.target.result)
      var major = listObj["major"]
      localStorage[major] = event.target.result
      $("#major-dropdown").val(major).change()
    }
    reader.readAsText(file)
 }

 function saveImage() {
    var container = $("#schedule-container")
    html2canvas(container, {
        onrendered: function(canvas) {
            // canvas is the final rendered <canvas> element
            var tempcanvas=document.createElement('canvas');
            var context=tempcanvas.getContext('2d');
            var width = container.width()
            var height = container.height()
            tempcanvas.width = width + 16
            tempcanvas.height = height + 12
            console.log(tempcanvas.width)
            console.log(tempcanvas.height)
            context.drawImage(canvas,0,0);
            var link=document.createElement("a");
            link.href=tempcanvas.toDataURL('image/jpg');   //function blocks CORS
            link.download = 'screenshot.jpg';
            // console.log(link.href)
            link.click();
        }
    });
}