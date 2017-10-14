function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

function getStringTime(date) {
    var suffix_string = "AM";
    var hours = date.getHours();
    if (hours > 12) {
        hours -= 12;
        suffix_string = "PM";
    } else if (hours == 12) {
        suffix_string = "PM";
    }
    var date_string = hours + ":" + pad(date.getMinutes()) + " " + suffix_string;
    return date_string;
}

function sortNumber(a,b) {
    return parseInt(a) - parseInt(b);
}

function updateProgressBar() {
    var time_header = document.getElementById("time_text")
    var now = new Date()
    time_header.innerHTML = getStringTime(now);

    var progress_bar = document.getElementById("block_progress_bar")
    var time_left = document.getElementById("time_left")
    var block_text = document.getElementById("block_text")
    var test_date_start = new Date(2017,4,15,18,41,0,0);
    var test_date_end = new Date(2017,4,15,18,43,0,0);

    var block_pre_start = new Date(2017,4,18,18,30,0,0);
    var block_one_start = new Date(2017,4,18,18,40,0,0);
    var block_two_start = new Date(2017,4,18,19,00,0,0);
    var block_three_start = new Date(2017,4,18,19,20,0,0);
    var block_four_start = new Date (2017,4,18,19,40,0,0);
    var block_end = new Date (2017,4,18,20,0,0,0);


    /*
    var block_one_start = new Date(2017,4,16,10,57,0,0);
    var block_two_start = new Date(2017,4,16,10,57,10,0);
    var block_three_start = new Date(2017,4,16,10,57,20,0);
    var block_four_start = new Date (2017,4,16,10,57,30,0);
    var block_end = new Date (2017,4,16,10,57,40,0);
    */

    var comparing_date_start;
    var comparing_date_end;

    if (now > block_end) {
        block_text.innerHTML = "Have a great evening!";
        comparing_date_start = block_four_start;
        comparing_date_end = block_end;
    } else {
    if (now > block_four_start) {
        block_text.innerHTML = "Block #4 (7:40 - 8:00)";
        comparing_date_start = block_four_start;
        comparing_date_end = block_end;
    } else {
    if (now > block_three_start) {
        block_text.innerHTML = "Block #3 (7:20 - 7:40)";
        comparing_date_start = block_three_start;
        comparing_date_end = block_four_start;
    } else {
    if (now > block_two_start) {
        block_text.innerHTML = "Block #2 (7:00 - 7:20)";
        comparing_date_start = block_two_start;
        comparing_date_end = block_three_start;
    } else {
    if (now > block_one_start) {
        block_text.innerHTML = "Block #1 (6:40 - 7:00)";
        comparing_date_start = block_one_start;
        comparing_date_end = block_two_start;
    } else {
        block_text.innerHTML = "Starting soon!";
        comparing_date_start = block_one_start;
    }}}}}

    if (now > comparing_date_start) {
        var percentage = Math.min((now.getTime() - comparing_date_start.getTime()) / (comparing_date_end.getTime() - comparing_date_start.getTime()) * 100, 100);
        var minutes_remaining = Math.max(Math.ceil((comparing_date_end.getTime() - now.getTime()) / 60000), 0);

        if (minutes_remaining > 1){
            time_left.innerHTML = Math.max(Math.ceil((comparing_date_end.getTime() - now.getTime()) / 60000), 0) + " minutes remaining."
        } else {
            if (minutes_remaining == 1) {
            time_left.innerHTML = "Less than a minute remaining."
        } else {
            time_left.innerHTML = "No time left!";
        }}
    }

    progress_bar.style['width'] = percentage + "%";
}

function updateLeaderboard() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var table = document.getElementById("leaderboard_table");
            var place_limit = 5;

            // Clear table
            table.innerHTML = "";

            // Setup title row
            row = table.insertRow(0);
            row.insertCell(-1).innerHTML = "<b>Place</b>";
            row.insertCell(-1).innerHTML = "<b>Name</b>";
            row.insertCell(-1).innerHTML = "<b>Points</b>";

            var place_dict = {};

            // Add rows
            for (x=0;x<Object.keys(json.users).length;x++) {
                user = Object.keys(json.users)[x];
                console.log(user);
                if (json.users[user].points.toString() in place_dict) {
                    place_dict[json.users[user].points.toString()].push(user);
                    console.log("appending")
                } else {
                    console.log("creating")
                    place_dict[json.users[user].points.toString()] = [];
                    place_dict[json.users[user].points.toString()].push(user);
                }
            }

            var sorted_keys = Object.keys(place_dict).sort(sortNumber).reverse();
            var place = 1;
            var done = false;
            for (x=0;x<sorted_keys.length;x++) {
                if (!done) {
                    var key_array = place_dict[sorted_keys[x]];
                    var sorted_key_array = {}
                    for (y=0;y<key_array.length;y++){
                        var user = json.users[key_array[y]]
                        sorted_key_array[user.name] = key_array[y]
                    }

                    for (y=0;y<key_array.length;y++) {
                        var user = json.users[sorted_key_array[Object.keys(sorted_key_array).sort()[y]]]
                        if (json.banned_users.indexOf(sorted_key_array[Object.keys(sorted_key_array).sort()[y]]) == -1){
                            row = table.insertRow(-1);
                            var place_cell = row.insertCell(-1)
                            place_cell.innerHTML = place;
                            switch (place) {
                                case (1):
                                    place_cell.style['background-color'] = "#ffd000";
                                    break;
                                case (2):
                                    place_cell.style['background-color'] = "#9e9d9c";
                                    break;
                                case (3):
                                    place_cell.style['background-color'] = "#9b5342";
                                    place_cell.style['color'] = "white";
                                    break;
                                default:
                                    break;
                            }

                            var name = row.insertCell(-1);
                            name.innerHTML = user.name;
                            name.classList = "name_cell";
                            row.insertCell(-1).innerHTML = user.points;
                            place++;

                            if (place > 5) {
                                done = true;
                            }
                        }
                    }

                }
            }
        }
    }
    xhttp.open("GET", "/json/raffle", true);
    xhttp.send();
}

function update() {
    updateProgressBar();

}

update();
updateLeaderboard();
setInterval(function(){update()}, 1000);;
setInterval(function(){updateLeaderboard()}, 30000);