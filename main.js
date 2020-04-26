var data = {}
var listData = {}
var classData = {}
var draggedItem = null
var clickedItem = null
const MAX_CLASS_LENGTH = 20

$(document).ready(function() {
    // Read the degrees.json file and store the object in data
    $.ajax({
        type: "GET",  
        url: "./degrees.json",
        dataType: "json",       
        success: function(response)  {
            data = response

            // Populate the first major list dropdown
            var defaultMajor = ""
            for (const major in data["majors"]) {
                if (defaultMajor === "") {
                    defaultMajor = major
                }
                $("#major-dropdown").append("<option value='" + major + "'>" + major + "</option>")
            }

            let firstMajor = defaultMajor
            let secondMajor = "-"
            let minor = "-"

            // Retrieve last dropdown values from cache
            if (localStorage["previousInputs"]) {
                let inputs = localStorage["previousInputs"].split(";")
                firstMajor = inputs[0]
                secondMajor = inputs[1]
                minor = inputs[2]
            }

            // Populate other dropdown lists, set dropdown values, and update lists accordingly
            $("#major-dropdown").val(firstMajor)
            populateSecondMajorList(firstMajor)
            populateMinorList(firstMajor)
            $("#major2-dropdown").val(secondMajor)
            $("#minor-dropdown").val(minor)
            updateLists(firstMajor, secondMajor, minor)
            saveLists()
        }
    });

    // On selecting a first major, update the dropdown lists, set the second major and minor to "-", and populate/cache the lists
    $("#major-dropdown").change(function() {
        let firstMajor = $("#major-dropdown option:selected").text()
        let secondMajor = "-"
        let minor = "-"
        populateSecondMajorList(firstMajor)
        populateMinorList(firstMajor)
        $("#major2-dropdown").val(secondMajor)
        $("minor-dropdown").val(minor)
        updateLists(firstMajor, secondMajor, minor)
        saveLists()
    });

    // On selecting a second major, set the minor to "-" if it equals the second major value, and populate/cache the lists
    $("#major2-dropdown").change(function() {
        var firstMajor = $("#major-dropdown option:selected").text()
        var secondMajor = $("#major2-dropdown option:selected").text()
        var minor = $("#minor-dropdown option:selected").text()
        if (minor === secondMajor) {
            minor = "-"
            $("#minor-dropdown").val(minor)
        }
        updateLists(firstMajor, secondMajor, minor)
        saveLists()
    })

    // On selecting a minor, set the second major to "-" if it equals the minor value, and populate/cache the lists
    $("#minor-dropdown").change(function() {
        var firstMajor = $("#major-dropdown option:selected").text()
        var secondMajor = $("#major2-dropdown option:selected").text()
        var minor = $("#minor-dropdown option:selected").text()
        if (secondMajor === minor) {
            secondMajor = "-"
            $("#major2-dropdown").val(secondMajor)
        }
        updateLists(firstMajor, secondMajor, minor)
        saveLists()
    })

    // Toolbar functions
    $("#refresh").click(function() {
        refreshLists()
    });
    $("#export").click(function() {
        downloadJSON()
    });
    $("#image").click(function() {
        saveImage()
    });
    $(".list-searchbar").bind("input", function(e) {
        let courseType = $(this).next().attr('id')
        let inputText = $("#"+courseType+"Search").val()
        filterLists(courseType) 
    }) 
    $(".plus-icon").click( function() {
        let list_id = $(this).parent().next().attr('id')
        let input_box = $(this).prev()
        addClass(input_box.val(), list_id)
    })
    document.getElementById('file').addEventListener('change', readFile, false);

    makeListsDroppable();

    // For click-drop: clicking anywhere outside of clicked item / valid list will cancel clicked action
    $(document).click(function(e) {
        if ( $(e.target).closest('.list').length === 0 ) {
            if (clickedItem != null) {
                removeClickFromLists()
                $(clickedItem).removeClass('clicked')
                clickedItem = null
            }
        }
    });
});

// Populates the second major list with majors != first major
function populateSecondMajorList(firstMajor) {
    var defaultSecondMajor = "-"
    var str = "<option value='-'>-</option>"
    for (const secondMajor in data["majors"]) {
        if (secondMajor != firstMajor) {
            str += "<option value='" + secondMajor + "'>" + secondMajor + "</option>"
        }
    }
    $("#major2-dropdown").html(str)
}

// Populates the minor list with minors != first major
function populateMinorList(firstMajor) {
    var defaultMinor = "-"
    var str = "<option value='-'>-</option>"
    for (const minor in data["minors"]) {
        if (minor != firstMajor) {
            str += "<option value='" + minor + "'>" + minor + "</option>"
        }
    }
    $("#minor-dropdown").html(str)
}

// Functions to get course name and type form courseId
function getCourseName(courseId) {
    let name = courseId.split("_")[1]
    name = name.replace(/\++/g, ' ');
    return name
}

function getCourseType(courseId) {
    return courseId.split("_")[0]
}

// Makes class and schedule lists droppable
function makeListsDroppable() {
    var lists = $('.list');

    for (let j = 0; j < lists.length; j ++) {
        const list = lists[j];
        // Set CSS attribute on dragover. Setting here instead of dragenter, since dragleave is triggered when dragging over list-item
        list.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (draggedItem != null) {
                var courseType = getCourseType($(draggedItem).attr("id"))
                if ($(this).hasClass("schedule-list") || $(this).attr("id") == courseType) {
                    $(this).attr("drop-active", true)
                } else {
                    $(this).attr("drop-active", false)
                }
            }
        });

        list.addEventListener('dragenter', function (e) {
            e.preventDefault();
        });

        list.addEventListener('dragleave', function (e) {
            $(this).removeAttr("drop-active")
        });

        // TODO: insert alphabetically rather than append
        list.addEventListener('drop', function (e) {
            if (draggedItem != null) {
                var courseType = getCourseType($(draggedItem).attr("id"))
                if ($(this).hasClass("schedule-list") || $(this).attr("id") == courseType && 
                    $(draggedItem).parent().attr('id') != $(this).attr('id')) {
                    this.append(draggedItem);
                    saveLists()
                }
                $(this).removeAttr("drop-active")
            }
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

// Removes the click-active attribute from lists
function removeClickFromLists() {
    $('.list').removeAttr("click-active")
}

// Allows list-items to be draggable
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

// Allows list-items to be clickable, for click and drop
function makeItemsClickable() {
    var list_items = $('.list-item');
    
    for (let i = 0; i < list_items.length; i++) {
        const item = list_items[i];

        item.addEventListener('click', function (e) {
            if (clickedItem != null) {
                $(clickedItem).removeClass('clicked')
                if (clickedItem == item || $(item).parent().attr("click-active") == "false") {
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
                var courseType = getCourseType($(clickedItem).attr("id"))
                if ($(list).attr('id') != parentList.attr('id')) {
                    if ($(list).hasClass("schedule-list") || $(list).attr("id") == courseType) {
                        $(list).attr('click-active', true)
                    } else {
                        $(list).attr('click-active', false)
                    }
                }
            }
        });
    }
}

// Returns cache key, a combination of all the dropdown values
function getCacheKey() {
    var firstMajor = $("#major-dropdown option:selected").text()
    var secondMajor = $("#major2-dropdown option:selected").text()
    var minor = $("#minor-dropdown option:selected").text()
    return firstMajor + ";" + secondMajor + ";" + minor
}

// Boolean functions to return whether a second major or minor exists
function isSecondMajor() {
    return $("#major2-dropdown option:selected").text() != "-"
}

function isMinor() {
    return $("#minor-dropdown option:selected").text() != "-"
}

// Clears and reformats lists
function clearLists() {
    $(".list").empty()
    removeClickFromLists()
    $(".list-item").remove()
    $(".list-searchbar").val("")
    $(".input-addclass").val("")
    listData = {}
    classData = {}
}

// Caches the lists and the selected dropdown values
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
    let inputs = getCacheKey()
    listObj["inputs"] = inputs
    localStorage[inputs] = JSON.stringify(listObj)
    localStorage["previousInputs"] = inputs
}

// Loads the lists given dropdown values
function loadLists(inputs) {
    if (localStorage[inputs]) {
        var listJSON = localStorage[inputs]
        loadListsFromJSON(listJSON)
        let inputsArray = inputs.split(";")
        let minor = inputsArray[2]
        if (minor == "-") {
            $("#minorCourses-container").hide()
            $("#minorCoursesTitle").hide()
        } else {
            $("#minorCourses-container").show()
            $("#minorCoursesTitle").show()
        }
    }
}

// Loads the lists given the JSON string
function loadListsFromJSON(jsonString) {
    var listObj = JSON.parse(jsonString)
    listData = {}
    classData = {}
    for (const listID in listObj["lists"]) {
        var div = $("#" + listID)
        var courses = listObj["lists"][listID]
        listData[listID] = courses
        var str = ""
        courses.forEach( function(item, index) {
            var courseName = getCourseName(item)
            var courseType = getCourseType(item)
            classData[courseName] = courseType
            str += '<div class="list-item '+courseType+'" draggable="true" id="'+item+'">'+courseName+'</div>'
        })
        div.html(str)
    }
    makeItemsDraggable()
    makeItemsClickable()
}

// Populates the lists, given the majors from the dropdown values
function updateLists(firstMajor, secondMajor, minor) {
    clearLists()

    // Check for cached lists
    inputs = getCacheKey()
    if (localStorage[inputs]) {
        loadLists(inputs)
        return
    }

    // Populate the lists using the data Object created from the json file
    // Each currDiv corresponds to a list_id (#lowerDivs, #upperDivs, etc)
    var majorObj = data["majors"][firstMajor]
    if (isSecondMajor()) {
        var majorObj2 = data["majors"][secondMajor]
    }
    for (const courseType in majorObj) {
        let currDiv = $("#" + courseType)
        if (currDiv.length == 0) {
            continue // currDiv is not a valid list ID
        }
        let courses = []
        majorObj[courseType].forEach( function(item, index) {
            courses.push(item)
            classData[item] = courseType
        });
        if (secondMajor != "-") {
            majorObj2[courseType].forEach( function(item, index) {
                if (!(item in classData)) {
                    courses.push(item)
                    classData[item] = courseType
                }
            });
        }
        // Put list in alphabetical order
        courses.sort()
        listData[courseType] = courses
    }

    //breadth list population
    let breadths = data["breadths"]["breadthCourses"]
    let courses = []
    breadths.forEach( function(item, index) {
        if (!(item in classData)) {
            courses.push(item)
            classData[item] = "breadths"
        }
    });
    courses.sort()
    listData["breadths"] = courses

    // minor list population
    if (isMinor()) {
        var minorObj = data["minors"][minor]
        let courses = []
        minorObj["minorCourses"].forEach( function(item, index) {
            if (!(item in classData)) {
                courses.push(item)
                classData[item] = "minorCourses"
            }
        });
        courses.sort()
        listData["minorCourses"] = courses
        $("#minorCourses-container").show()
        $("#minorCoursesTitle").show()
    } else {
        $("#minorCourses-container").hide()
        $("#minorCoursesTitle").hide()
    }

    for (const courseType in listData) {
        let currDiv = $("#" + courseType)
        var str = ""
        var newCourses = []
        listData[courseType].forEach( function(item, index) {
            let item_id = courseType+"_"+item.replace(/\s+/g, '+');
            newCourses.push(item_id)
            str += '<div class="list-item '+courseType+'" draggable="true" id="'+item_id+'">'+item+'</div>'
        });
        listData[courseType] = newCourses
        currDiv.html(str)
    }

    makeItemsDraggable();
    makeItemsClickable();
}

// Clears the cache, updates the list with the selected majors
function refreshLists() {
    let firstMajor = $("#major-dropdown option:selected").text()
    let secondMajor = $("#major2-dropdown option:selected").text()
    let minor = $("#minor-dropdown option:selected").text()
    localStorage.clear()
    updateLists(firstMajor, secondMajor, minor)
    saveLists()
}

// Downloads a JSON file with the current list state, for export functionality
function downloadJSON() {
    var inputs = getCacheKey()
    if (localStorage[inputs]) {
        jsonData = localStorage[inputs]
        var data = "text/json;charset=utf-8," + encodeURIComponent(jsonData);
        var a = document.createElement('a')
        a.href = "data:" + data;
        a.download = "schedule.sch"
        var container = document.getElementById("app")
        container.appendChild(a)
        a.click()
        container.removeChild(a)
    }
}

// Reads file on import and selects appropriate dropdown values, populates the list accordingly
function readFile (evt) {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
        clearLists()
        var listObj = JSON.parse(event.target.result)
        var inputs = listObj["inputs"]
        localStorage[inputs] = event.target.result
        let inputsArray = inputs.split(";")
        firstMajor = inputsArray[0]
        secondMajor = inputsArray[1]
        minor = inputsArray[2]
        $("#major-dropdown").val(firstMajor)
        populateSecondMajorList(firstMajor)
        populateMinorList(firstMajor)
        $("#major2-dropdown").val(secondMajor)
        $("#minor-dropdown").val(minor)
        loadLists(inputs)
    }
    reader.readAsText(file)
 }

 // Saves the schedule as an image
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
            context.drawImage(canvas,0,0);
            var link=document.createElement("a");
            link.href=tempcanvas.toDataURL('image/jpg');   //function blocks CORS
            link.download = 'screenshot.jpg';
            link.click();
        }
    });
}

function filterLists(courseType) {
    s = $("#"+courseType+"Search").val().toUpperCase()
    
    listData[courseType].forEach( function(courseID, index) {
        let courseName = getCourseName(courseID)
        let courseDiv = $("#" + $.escapeSelector(courseID))
        courseName = courseName.toUpperCase()
        if (!(courseName.includes(s)) && courseDiv.parent().hasClass("class-list")) {
            courseDiv.hide()
        } else {
            courseDiv.show()
        }
    });
}

// Add a class if it does not already exist in the schedule
function addClass(input, list_id) {
    console.log(list_id)
    if (!(input)) {
        console.log("input cannot be empty")
        return
    }
    input = input.toUpperCase()
    if (!(isValidInput(input))) {
        console.log("input contains invalid characters or is too long")
        return
    }
    if (input in classData) {
        console.log("class already exists in current schedule")
        return
    }
    let courses = []
    if ("addedClass" in listData) {
        courses = listData[list_id]
    }
    let courseType = "addedClass"
    let courseName = input
    let item = courseType+"_"+courseName.replace(/\s+/g, '+')
    courses.push(item)
    listData[courseType] = courses
    classData[courseName] = courseType
    let div = $("#"+list_id)
    let str = '<div class="list-item '+courseType+'" draggable="true" id="'+item+'">'+courseName+'</div>'
    div.append(str)
    saveLists()
    makeItemsClickable()
    makeItemsDraggable()
}

function isValidInput(input) {
    var letterNumber = /^[0-9a-zA-Z\s]+$/
    if(input.length <= MAX_CLASS_LENGTH && input.match(letterNumber)) {
        return true;
    }
    return false
}
