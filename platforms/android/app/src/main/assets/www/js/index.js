let app = {
    URL: ' http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=',
    gender: '',
    KEY: 'liu00414-tundra',
    tinyshell: null,
    imgBaseURL: '',
    favsData: [],
    init: function () {
        //now this will run in browser Or emulator
        let mainTab = document.querySelector('.main');
        mainTab.addEventListener('click', app.backHome);
        let favsTab = document.querySelector('.favs');
        favsTab.addEventListener('click', app.showFavs);
        //window.addEventListener('popstate', app.browserBack);
        window.addEventListener('popstate', app.browserBack);
        history.replaceState({}, "Home", "#home");

        //add eventListeners to dropdown

        document.querySelector('.dropbtn').addEventListener('click', app.chooseGender);

        //set sessionStorage:check if it already exist, create new or load existing data
//       NO NEED TO CHECK sessionStorage.getItem(app.KEY) ? app.favsData = JSON.parse(sessionStorage.getItem(app.KEY)) : 
        sessionStorage.setItem(app.KEY, JSON.stringify(app.favsData));
        app.getData();

    },
    getData: function () {
        let url = ''.concat(app.URL, app.gender);
        let req = new Request(url, {
            method: 'Get',
            mode: 'cors'
        });
        console.log(url);
        fetch(req)
            .then((result) => {
                return result.json()
            })
            .then(
                (data) => {
                    console.log(data);
                    app.imgBaseURL = decodeURIComponent(data.imgBaseURL);
                    console.log(app.imgBaseURL);
                    app.makeCards(data.profiles);

                })
            .catch(
                function (err) {
                    alert(err);
                }
            )


    },
    makeCards: function (profiles) {
        console.log(profiles);

        let df = new DocumentFragment();
        profiles.forEach((profile) => {
           // app.z = app.z - 1;
            let card = document.createElement('div');
            card.className = 'card fixed top'; // active
            card.setAttribute('id', profile.id);
            card.setAttribute('first', profile.first);
            card.setAttribute('last', profile.last);
            card.setAttribute('avatar', profile.avatar);
            //card.style.zIndex = app.z;
            let name = document.createElement('h4');
            let header = document.createElement('header');
            header.appendChild(name);
            header.className = profile.gender;
            let img = document.createElement('img');
            let details = document.createElement('p');
            let detailIcon = document.createElement('p');
            detailIcon.className = 'icon marker';
            name.textContent = profile.first + ' ' + profile.last;
            img.src = ''.concat('http:', app.imgBaseURL, profile.avatar);
            img.alt=profile.first+' '+profile.last+'\'s avatar';
            details.textContent = ''.concat('Distance: ', profile.distance);
            
            if(profile.gender=='male'){
                card.style.color='#6651a7';
            }else{
                card.style.color='#e4758f';
            }

            card.appendChild(img);
            card.appendChild(header);
            card.appendChild(detailIcon);
            card.appendChild(details);
            df.appendChild(card);
            //make tinyShell PROBLEMS HERE
            app.tinyshell = new t$(card);
            app.tinyshell.addEventListener(t$.EventTypes.SWIPELEFT, app.deleteCard);
            app.tinyshell.addEventListener(t$.EventTypes.SWIPERIGHT, app.saveCard);
        })
        document.querySelector('#home .cards').appendChild(df);
        app.showFirstCard();
        
        console.log(app.tinyshell);
    },
    showFirstCard:function(){
       let active = document.querySelector('#home .card.active');
        console.log(document.querySelector('.card'));
        if(!active){
        document.querySelector('#home .card').classList.add('active');
        }; 
    },
    deleteCard: function (ev) {
        let cardToDelete = ev.currentTarget;
        cardToDelete.classList.add('moveLeft');
        app.notification('Profile Rejected.');
        
        //remove element from DOM and target from t$ targets

        
        setTimeout((function () {


            //remove the target from the array of targets
            //and remove its event listeners
            app.tinyshell.removeTarget(cardToDelete);
            //now remove the list item from the page
            console.log(cardToDelete.parentNode);
            this.parentNode.removeChild(cardToDelete);
            //show the next card
            
            //check how many cards left;
            app.checkCardsLeft();

        }).bind(cardToDelete), 500);
        console.log(app.tinyshell);
    },
    saveCard: function (ev) {
        let cardToSave = ev.currentTarget;
        cardToSave.classList.add('moveRight');
        
        app.notification('Profile Saved!');
        

        setTimeout((function () {
            //add data to sessionStorage
            let obj = {
                'id': cardToSave.getAttribute('id'),
                'first': cardToSave.getAttribute('first'),
                'last': cardToSave.getAttribute('last'),
                'avatar': cardToSave.getAttribute('avatar')
            };
            console.log(cardToSave.getAttribute('avatar'));
            app.favsData.push(obj);
            sessionStorage.setItem(app.KEY, JSON.stringify(app.favsData));
            app.makeFavsCards();

            //remove the target from the array of targets
            //and remove its event listeners

            app.tinyshell.removeTarget(cardToSave);
            //now remove the list item from the page
            console.log(cardToSave.parentNode);
            this.parentNode.removeChild(cardToSave);
            //show the next card
            
            //check how many cards left;

            app.checkCardsLeft();
            

        }).bind(cardToSave), 500);


    },
    notification:function(message){
        let popup=document.querySelector('.popup-notice');
        popup.textContent=message;
        
        if(message=='Profile Rejected.'){popup.style.backgroundColor='rgba(0,0,0,0.7)'}else{
            popup.style.backgroundColor='rgba(102, 81, 167, 0.8)';
        }
        
        popup.classList.add('show');
        //popup.classList.add('move-to-center');
        
        
        setTimeout(()=>{popup.classList.remove('show')},500);
    },
    checkCardsLeft: function () {
        let cardNum = document.querySelectorAll('#home .card').length;
        if (cardNum <= 3) {
            app.getData();
        } else {};
        //show the next card
        app.showFirstCard();
    },
    backHome: function (ev) {
        history.pushState({}, "Home", `#home`);
         document.querySelector('.main').classList.add('tab-active');
        document.querySelector('.favs').classList.remove('tab-active');
        document.querySelector('#home').classList.add('active');
        document.querySelector('#favs').classList.remove('active');

    },
    showFavs: function () {
        history.pushState({

        }, "Favs", `#favs`);
        app.makeFavsCards();
        document.querySelector('.main').classList.remove('tab-active');
        document.querySelector('.favs').classList.add('tab-active');
        document.querySelector('#home').classList.remove('active');
        document.querySelector('#favs').classList.add('active');
    },
    makeFavsCards: function () {

        let df = new DocumentFragment();
        if (app.favsData.length != 0) {
            app.favsData.forEach((fav) => {
                let card = document.createElement('div');
                card.className = 'card active';

                let deleteButton = document.createElement('div');
                deleteButton.className = 'icon remove';
                let name = document.createElement('p');
                //                        let header = document.createElement('header');
                //                        header.appendChild(name);
                name.className = 'fav-name';
                let img = document.createElement('img');
                img.className = 'small-avatar';
                name.textContent = fav.first + ' ' + fav.last;
                img.src = ''.concat('http:', app.imgBaseURL, fav.avatar);
                img.alt=fav.first+' '+fav.last+'\'s avatar';
                deleteButton.setAttribute('data-key', fav.id);
                deleteButton.setAttribute('data-name', fav.first+' '+fav.last);
                deleteButton.addEventListener('click', app.deleteFav);
                card.appendChild(deleteButton);
                card.appendChild(img);
                card.appendChild(name);

                df.appendChild(card);

            })
            document.getElementById('favs').innerHTML = '';
            document.getElementById('favs').appendChild(df);
        } else {
            document.getElementById('favs').innerHTML = '';
            document.getElementById('favs').innerHTML = '<p>There is no favourites to show! Swipe right to save favourite profiles.</p>';
            document.querySelector('#favs p').className='noFavMessage';
        };


    },
    deleteFav: function (ev) {
        //Delete data from sessionStorage
        app.favsData = app.favsData.filter(fav => fav.id != ev.target.getAttribute('data-key'));
        let popBox = document.querySelector('.popup-deleteFav');
        popBox.textContent=ev.target.getAttribute('data-name')+' has been deleted!'
        popBox.classList.add('show');

        setTimeout(function () {
            sessionStorage.setItem(app.KEY, JSON.stringify(app.favsData));
            let favCard=ev.target.parentNode;
            console.log(favCard);
            favCard.parentNode.removeChild(favCard);
            //app.makeFavsCards();
            popBox.classList.remove('show');
            if(app.favsData.length==0){
                document.getElementById('favs').innerHTML = '';
            document.getElementById('favs').innerHTML = '<p>There is no favourites to show! Swipe right to save favourite profiles.</p>';
            document.querySelector('#favs p').className='noFavMessage';
            }
        }, 500);

    },
    browserBack: function () {
        console.log('user hit the browser back button');
        console.log(location.hash);
        if (location.hash == '#home') {
            app.backHome();
        } else {
            app.showFavs();
        }

    },
    chooseGender: function (ev) {
        ev.preventDefault();
        document.querySelector('.dropdown-content').classList.add('show-options');
        let options = document.querySelectorAll('.dropdown-content li');
        options.forEach((option) => {
            option.addEventListener('click', app.setGender);
        })
    },
    setGender: function (ev) {
        ev.preventDefault();
        let gender = ev.target.textContent;

        document.querySelector('.dropbtn').textContent = gender;

        if (gender == 'Both Genders') {
            app.gender = '';
        } else {
            app.gender = gender.toLowerCase();
        };
        document.querySelector('.dropdown-content').classList.remove('show-options');
        console.log(app.gender);
        document.querySelector('#home .cards').innerHTML = '';
        app.getData();

    }


}


let ready = ('deviceready' in document) ? 'deviceready' : 'DOMContentLoaded';
document.addEventListener(ready, app.init);
