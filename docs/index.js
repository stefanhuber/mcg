var mcSection = function(question, answers) {
    var html = "";

    html += '<section class="mc-question">';
    html += '<h3>' + question + '</h3>';
    html += '<ul>';
    html += answers.map(function(item) { return '<li class="' + (item[0].length > 0 ? "correct" : "incorrect") +  '">' + item[1] + "</li>"; }).join("");
    html += '</ul>';
    html += "</section>";

    return html;
};

var shuffleQuestions = function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

var parse = function(file, callback) {
    Papa.parse(file, {
        complete: function(result) {
            localStorage.setItem('mc-questions', JSON.stringify(transformInput(result.data)));
            callback();
        }
    }); 
};

var unparse = function() {
    var data = [];
    var questions = JSON.parse(localStorage.getItem('mc-questions'));

    questions.forEach(function(q) {
        data.push([q.question, '']);
        q.answers.forEach(function(a) {
            data.push(a);
        });
    });

    return Papa.unparse(data);
};

var transformInput = function(input) {
    if (Array.isArray(input)) {
        var items = [];
        var item = {};

        for (var i = 0; i < input.length; i++) {
            if (input[i][0] == '' || input[i][0] == 'x') {
                item.answers.push(input[i]);
            } else {
                if (i > 0) {
                    items.push(item);
                }

                item = {
                    question : input[i][0] ,
                    answers : []
                }
            }
        }
        items.push(item);
        
        return items;
    }
};

var renderQuestions = function(questions) {
    if (Array.isArray(questions)) {
        var html = questions.map(function(item) { return mcSection(item.question, item.answers); }).join("");
        document.querySelector('.mc-questions').innerHTML = html;
    }
};

var init = function() {
    if (localStorage.getItem('mc-questions')) {
        document.querySelector('#dropzone').classList.add('hide');
        document.querySelector('main').classList.remove('hide');
        var questions = JSON.parse(localStorage.getItem('mc-questions'));
        renderQuestions(questions);
    } else {
        document.querySelector('#dropzone').classList.remove('hide');
        document.querySelector('main').classList.add('hide');
    }
};

document.addEventListener("DOMContentLoaded", function() {
    init();
    var dropzone = document.querySelector("#dropzone");
    var nav = document.querySelector('nav');

    nav.addEventListener('click', function(e) {
        if (e.target.dataset.action == 'toggle-answers') {
            document.body.classList.toggle('answers');
        } else if (e.target.dataset.action == 'print') {
            print();
        } else if (e.target.dataset.action == 'clear') {
            localStorage.removeItem('mc-questions');
            init();
        } else if (e.target.dataset.action == 'toggle-numbering') {
            document.body.classList.toggle('numbering');
        } else if (e.target.dataset.action == 'shuffle') {
            var questions = JSON.parse(localStorage.getItem('mc-questions'));
            localStorage.setItem('mc-questions', JSON.stringify(shuffleQuestions(questions))); 
            init();
        } else if (e.target.dataset.action == 'export') {
            window.open('data:text/csv;charset=utf-8,' + encodeURI(unparse()));
        }
    });

    dropzone.addEventListener("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.target.classList.add('dragover');
    }, false);

    dropzone.addEventListener("dragleave", function(e) {
        e.stopPropagation();
        e.target.classList.remove('dragover');
    }, false);

    dropzone.addEventListener("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.target.classList.remove('dragover');

        parse(e.dataTransfer.files[0], function() { init(); });       
    });

});

