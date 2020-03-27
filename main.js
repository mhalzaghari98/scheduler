$(document).ready(function() {
    var data;
    //I am using a jquery library to read the json file, and then convert it into an object that I can use
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

            // Populate the minor list dropdown
            var defaultMinor = ""
            // Populate the major list dropdown
            for (const minor in data["minors"]) {
                if (minor != defaultMajor) {
                    $("#minor-dropdown").append("<option value='" + minor + "'>" + minor + "</option>")
                }
            }
    
            /*
            if (localStorage["lastDropdown"]) {
                defaultMajor = localStorage["lastDropdown"]
            }
            */
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
                    this.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                });
    
                list.addEventListener('dragenter', function (e) {
                    e.preventDefault();
                    this.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                });
    
                list.addEventListener('dragleave', function (e) {
                    this.style.backgroundColor = 'white';
                });
    
                list.addEventListener('drop', function (e) {
                    // This is a workaround for drop. For some reason, draggedItem includes 'null' items from previous major selection
                    console.log("drop")
                    if (draggedItem != null) {
                        this.append(draggedItem);
                        saveLists()
                    }
                    this.style.backgroundColor = 'white';
                });
            }
        }
    }
    
    function saveLists() {
        var listObj = {}
        $('.list').each(function() {
            var key = $(this).attr('id')
            var courses = []
            $(this).children().each(function () {
                courses.push($(this).attr('id'))
            });
            listObj[key] = courses
        });
        var dropdownValue = $("#major-dropdown option:selected").text()
        localStorage[dropdownValue] = JSON.stringify(listObj)
    }
    
    function loadLists(dropdownValue) {
        if (localStorage[dropdownValue]) {
            var listJSON = localStorage[dropdownValue]
            var listObj = JSON.parse(listJSON)
            for (const listID in listObj) {
                var div = $("#" + listID)
                var courses = listObj[listID]
                var str = ""
                courses.forEach( function(item, index) {
                    str += '<div class="list-item" draggable="true" id="'+item+'">'+item+'</div>'
                })
                div.html(str)
            }
            console.log(listObj)
        }
        makeItemsDraggable()
    }
    
    function clearLists() {
        $(".list").empty()
        $(".list").css("background-color", "rgba(253, 253, 253, 100)")
        $(".list-item").remove()
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
                console.log("error: courseType '" + courseType + "' is an invalid div")
                continue
            }
            var str = ""
            majorObj[courseType].forEach( function(item, index) {
                str += '<div class="list-item" draggable="true" id="'+item+'">'+item+'</div>'
            });
            currDiv.html(str)
        }
    
        makeItemsDraggable();
    }
    
    $("#major-dropdown").change(function() {
        var chosenMajor = $("#major-dropdown option:selected").text()
        console.log(chosenMajor)

        // Populate the minor list dropdown
        $("#minor-dropdown").empty()
        $("#minor-dropdown").append("<option value=' '> </option>")
        var defaultMinor = ""
        for (const minor in data["minors"]) {
            if (minor != chosenMajor) {
                $("#minor-dropdown").append("<option value='" + minor + "'>" + minor + "</option>")
            }
        }
    
        updateLists(chosenMajor)
        saveLists()
        localStorage["lastDropdown"] = chosenMajor
    })
    
    $("#refresh-symbol").click(function() {
        refreshLists()
    })
    
    function refreshLists() {
        var chosenMajor = $("#major-dropdown option:selected").text()
    
        localStorage.clear()
        updateLists(chosenMajor)
    }
})