//I am using a jquery library to read the csv file, and then convert it into an array that I can use
var data;
$.ajax({
type: "GET",  
url: "./Test.csv",
dataType: "text",       
success: function(response)  
{
//Converting csv file to array
data = $.csv.toArrays(response);

console.log(data)
var major = 'Computer Science Major'

for (let i = 0; i< data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] === major) {
            j++
            if (data[i][j] === 'Lower Divs') {
                j++
                while (data[i][j] != 'Upper Divs') {
                    $('#lowerDivs').append('<div class="list-item" draggable="true">' + data[i][j] + '</div>');
                    j++
                }
            } if (data[i][j] === 'Upper Divs') {
                j++
                while (data[i][j] != 'Breadths') {
                    $('#upperDivs').append('<div class="list-item" draggable="true">' + data[i][j] + '</div>');
                    j++
                }
            } if (data[i][j] === 'Breadths') {
                j++
                while (data[i][j] != 'End') {
                    $('#breadths').append('<div class="list-item" draggable="true">' + data[i][j] + '</div>');
                    j++
                }
            }
        }
    }
}
    
//Code snippet that allows the list items to be dragged into different boxes. 
//I pulled it from this Youtube video: https://www.youtube.com/watch?v=tZ45HZAkbLc

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
//The brackets at the end include the cvs to jquery so that I can have the data I append add the event listeners. 
}   
});