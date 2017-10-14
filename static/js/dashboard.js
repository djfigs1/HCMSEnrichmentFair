function loadTable() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var table = document.getElementById("presentation_table");
            // Clear table
            table.innerHTML = "";

            // Setup title row
            row = table.insertRow(0);
            row.insertCell(-1).innerHTML = "<b>Presentation Name</b>";
            row.insertCell(-1).innerHTML = "<b>Name of Presenter</b>";
            row.insertCell(-1).innerHTML = "<b>Location</b>";
            row.insertCell(-1).innerHTML = "<b>Raffle Code</b>";
            row.insertCell(-1).innerHTML = "<b>Current Point Value</b>";
            row.insertCell(-1).innerHTML = "<b>Times Redeemed</b>";
            row.insertCell(-1).innerHTML = "<b>Actions</b>";

            //Sort Presentations by Name

            var name_presentation_dict = {}
            for (x=0;x<Object.keys(json.presentations).length;x++) {
                presentation = Object.keys(json.presentations)[x];

                if (json.presentations[presentation].name in name_presentation_dict) {
                    name_presentation_dict[json.presentations[presentation].name].push(presentation);
                } else {
                    name_presentation_dict[json.presentations[presentation].name] = [];
                    name_presentation_dict[json.presentations[presentation].name].push(presentation);
                }
            }

            // Add rows
            for (x=0;x<Object.keys(json.presentations).length;x++) {
                presentation_array = name_presentation_dict[Object.keys(name_presentation_dict).sort()[x]]
                for (y=0;y<Object.keys(presentation_array).length;y++) {
                    var presentation = presentation_array[y]
                    row = table.insertRow(-1);

                    var redeemed = 0;
                    if ("times_redeemed" in json.presentations[presentation]) {
                        redeemed = json.presentations[presentation].times_redeemed;
                    }

                    row.insertCell(-1).innerHTML = json.presentations[presentation].name;
                    row.insertCell(-1).innerHTML = json.presentations[presentation].presenter_name;
                    row.insertCell(-1).innerHTML = json.presentations[presentation].location;
                    row.insertCell(-1).innerHTML = presentation;
                    row.insertCell(-1).innerHTML = json.presentations[presentation].point_value;
                    row.insertCell(-1).innerHTML = redeemed;
                    row.insertCell(-1).innerHTML = "<a href='/present/" + presentation +"'>View</a><a class='remove_button' href='/presentation_action/" + presentation + "/remove'>Remove</a>";
                }

            }
        }
    }
    xhttp.open("GET", "/json/presentation", true);
    xhttp.send();

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var table = document.getElementById("raffle_table");
            // Clear table
            table.innerHTML = "";

            // Setup title row
            row = table.insertRow(0);
            row.insertCell(-1).innerHTML = "<b>Name</b>";
            row.insertCell(-1).innerHTML = "<b>UUID</b>";
            row.insertCell(-1).innerHTML = "<b>Points</b>";
            row.insertCell(-1).innerHTML = "<b>Actions</b>";

            // Add rows
            for (x=0;x<Object.keys(json.users).length;x++) {
                user = Object.keys(json.users)[x];
                row = table.insertRow(-1);

                var action_string = "";
                if (json.banned_users.indexOf(user) >= 0) {
                    row.insertCell(-1).innerHTML = "<s style='color:red;'>" + json.users[user].name + "</s>";
                    row.insertCell(-1).innerHTML = "<s style='color:red;'>" + user + "</s>";
                    row.insertCell(-1).innerHTML = "<s style='color:red;'>" + json.users[user].points + "</s>";
                    action_string += "<a href='/raffle_action/unban/" + user +"'>Unban</a>";
                } else {
                    row.insertCell(-1).innerHTML = json.users[user].name;
                    row.insertCell(-1).innerHTML = user
                    row.insertCell(-1).innerHTML = json.users[user].points;
                    action_string += "<a href='/raffle_action/ban/" + user +"'>Ban</a>";
                }

                action_string += "<a href='/raffle_action/remove/" + user + "'>Remove</a>";
                row.insertCell(-1).innerHTML = action_string;
            }
        }
    }
    xhttp.open("GET", "/json/raffle", true);
    xhttp.send();

}
loadTable();
setInterval(function(){loadTable()}, 30000);