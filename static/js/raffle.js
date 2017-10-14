Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function chooseRandom(array) {
    length = array.length;
    return array[getRandomArbitrary(0,length - 1)]
}

function drawRaffle() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var winner_text = document.getElementById("raffle_winner");

            var users = [];
            for (x=0;x<Object.keys(json.users).length;x++) {
                var user = json.users[Object.keys(json.users)[x]]

                for (y=0;y<user.points;y++) {
                    users.push(Object.keys(json.users)[x]);
                }
            }

            var winner_string = ""
            try{
                for (x=0;x<3;x++){
                    winner = chooseRandom(users)
                    winner_string += json.users[winner].name + ", ";
                    console.log(winner)
                    users.remove(winner)
                }
            } catch(err) {
                console.error(err.message);
            }
            winner_text.innerHTML = winner_string.slice(0,-2);
        }
    }
    xhttp.open("GET", "/json/raffle", true);
    xhttp.send();
}