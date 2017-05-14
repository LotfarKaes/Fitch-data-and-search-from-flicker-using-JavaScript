
// Lotfar kaes 

//main function 
var OPE = {};

(function () {
    'start';

})();

// Flicker APPlication functions 
(function () {
    'start';

    OPE.Flickr = {
        apiKey: 'b54580f369a7eeebecb2004dc429d08f',
        apiMethod: 'flickr.photos.search',
        apiUrl: 'https://api.flickr.com/services/rest/',
        imgUrlPattern: 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_{area}.jpg',
        imgPreview: "<div class='flickr-photo{class}'><img tabindex='0' data-index='{index}' data-id='{photoId}' data-props='{props}' class='th' src='{path}' alt='{title}'/><span class='glyphicon glyphicon-check ' aria-hidden='true'></span></div>",
        isFlickrPicturesList: false,
        isShowGallery: false,
        counter: 0,
        collectedPhotos: {},
        currentPage: 0,
        maxPage: 0,

        // start header 
        startClass: 'start-header',    // don't need that one ....
        init: function () {
            this.body = OPE.$('body');
            //search input field
            this.searchInputCol = OPE.$('#search-input');
            //unmatch input display error message 
            this.searchErrorSel = OPE.$('#search-error');
            //search form, sned a request input
            this.searchFormCol = OPE.$('#search-form');
            //search button
            //this.searchButtonCol = OPE.$('#search-Button');
            this.morePhotosCol = OPE.$('#flickr-more-container');
            this.loading = OPE.$('#loading');
            this.emptymsg = OPE.$('#emptymsg');
            this.gallerymsg = OPE.$('#gallerymsg');
            this.galleryCol = OPE.$('#gallery');
            this.galleryListCol = OPE.$('#gallery-list');
            this.gallerySelectedCol = OPE.$('#gallery-selected');
            this.gallerySelListsCol = OPE.$('#gallery-sel-list');
            this.galleryCountCol = OPE.$('#show-sle-gallery-count');
            this.displaySelectedPhotosCol = OPE.$('#show-selected');
            this.galleryStatSel = OPE.$('#show-sel-gallery-stat');
            this.galleryBackButtoCol = OPE.$('#gallery-back');
            this.searchText = '';
 
            // modal script 
            this.modalTemplate = OPE.$('#modal-template');
            this.modalTitle = OPE.$('#modal-title');
            this.modalContent = OPE.$('#modal-content');
            this.modalClose = OPE.$('#modal-close');
            this.events();
        },

        events: function  () {
            OPE.Events.on(this.searchFormCol, 'submit', this.sendRequest.bind(this));
            OPE.Events.on(this.galleryListCol, 'click', this.selectPhotos.bind(this), 'img');
            OPE.Events.on(this.gallerySelectedCol, 'click', this.preparePhoto.bind(this), 'img');
            OPE.Events.on(this.displaySelectedPhotosCol, 'click', this.showSelected.bind(this));
            OPE.Events.on(this.galleryBackButtoCol, 'click', this.backToAllPhotos.bind(this));
            OPE.Events.on(this.modalClose, 'click', this.hideModal.bind(this));
        },

        
         // Build http query to flickr api
         // q - text for searching
         // p - current page
         // returns {string}
         
        buildQuery: function (q, p) {
            p = p ? '&page=' + p : '';
            return this.apiUrl
                    + '?method=' + this.apiMethod
                    + '&format=json'
                    + '&api_key=' + this.apiKey
                    + '&text=' + encodeURI(q)
                    + '&content_type=7&nojsoncallback=1'
                    + p;
        },

        validation: function (text) {
            return !!text.length;
        },

        //send a request
        sendRequest: function (e) {
            e.preventDefault();

            this.loadingShow();
            this.searchText = this.searchInputCol.value;

            if (!this.validation(this.searchText)) {
                this.showError();
                return;
            } else {
                this.hideError();
            }

            this.backToAllPhotos();
            this.galleryListCol.innerHTML = '';

            OPE.Ajax({
                url: this.buildQuery(this.searchText),
                callback: this.parseResponse.bind(this)
            });
        },

        // parsing data in JSON formate
        parseResponse: function (response) {
            var data = JSON.parse(response);
            if (data.stat == 'ok') {
                this.currentPage = data.photos.page;
                this.maxPage = data.photos.pages;
                this.createViews(data.photos.photo);

            } else {
                this.emptymsgShow();
            }
        },

        preparePhoto: function (e, el) {
            var img, path, photo;

            img = document.createElement('img');

            if (this.isShowGallery) {
                photo = this.collectedPhotos[el.dataset.id];
                if (typeof photo == 'object') {
                    path = this.imgUrlPattern
                            .replace('{farm-id}', photo.farm)
                            .replace('{server-id}', photo.server)
                            .replace('{id}', photo.id)
                            .replace('{secret}', photo.secret)
                            .replace('{area}', 'b');

                    img.alt = photo.title;
                    img.src = path;

                    this.showModal({
                        title: photo.title,
                        content: OPE.nodeToString(img)
                    });
                }
            }
        },

        
         //Show error message
         //@param str - error message text
       
        showError: function (str) {
            OPE.show(this.searchErrorSel);
            if (typeof str == 'string') {
                this.searchErrorSel.innerHTML = str;
            }
        },
     
        //Hide error message
          hideError: function () {
            OPE.hide(this.searchErrorSel);
          },

     
        //organize and produce picture view
        createViews: function (photos) {
            var picViewPath, selected, i, f, img, item, out;
            f = photos.length;
            out = [];
            this.allPhotos = photos;

            for (i = 0; i < f; i++) {
                selected = typeof this.collectedPhotos[photos[i].id] == 'object' && !this.isShowGallery ? ' selected' : '';

                picViewPath = this.imgUrlPattern
                        .replace('{farm-id}', photos[i].farm)
                        .replace('{server-id}', photos[i].server)
                        .replace('{id}', photos[i].id)
                        .replace('{secret}', photos[i].secret)
                        .replace('{area}', 'q');

                item = this.imgPreview
                        .replace('{path}', picViewPath)
                        .replace('{index}', i)
                        .replace('{class}', selected)
                        .replace('{photoId}', photos[i].id)
                        .replace('{props}', OPE.escapeTags(JSON.stringify(photos[i])))
                        .replace('{title}', OPE.escapeTags(photos[i].title));

                out.push(item);
            }

            this.displayView(out.join(''));
        },

        //show pictures view 
        displayView: function (out) {
            if (!!out) {
                if (this.isFlickrPicturesList) {
                    if (this.currentPage == this.maxPage) {
                        OPE.hide(this.morePhotosCol);
                    } else if (this.currentPage < this.maxPage) {
                        OPE.show(this.morePhotosCol);
                    }
                    OPE.show(this.galleryCol);
                    this.galleryListCol.insertAdjacentHTML('beforeend', out);
                } else if (this.isShowGallery) {
                    this.gallerySelListsCol.innerHTML = out;
                }
                this.loadingHide();
                this.emptymsgHide();
                this.gallerymsgShow();
            } else {
                this.emptymsgShow();
                this.loadingHide();
                this.gallerymsgHide();
            }
        },

        //slelected pictures add in gallery 
        selectPhotos: function (e, el) {
            if (this.isFlickrPicturesList) {
                if (OPE.hasClass(el.parentNode, 'selected')) {
                    OPE.removeClass(el.parentNode, 'selected');
                    this.removePhotoToCollection(el.dataset.id);
                } else {
                    OPE.addClass(el.parentNode, 'selected');
                    this.addPhotoToCollection(el);
                }
            }
        },

        //counting the slected pictures in gallery
		//less selected item
		//total count 
        addPhotoToCollection: function (el) {
            this.collectedPhotos[el.dataset.id] = JSON.parse(el.dataset.props);
            this.counter += 1;
            if (this.counter) {
                OPE.show(this.galleryStatSel);
            }
            this.galleryCounter(this.counter);
        },

        removePhotoToCollection: function (i) {
            if (typeof this.collectedPhotos[i] == 'object') {
                delete this.collectedPhotos[i];
                this.counter -= 1;
                if (!this.counter) {
                    OPE.hide(this.galleryStatSel);
                }
                this.galleryCounter(this.counter);
            }
        },

        galleryCounter: function (counter) {
            this.galleryCountCol.innerHTML = counter + ' ' + OPE.plural(counter, 'photo');
        },

        showSelected: function () {
            var selected = [], i;
            for (i in this.collectedPhotos) {
                if (this.collectedPhotos.hasOwnProperty(i)) {
                    selected.push(this.collectedPhotos[i]);
                }
            }

            this.isFlickrPicturesList = false;
            this.isShowGallery = true;

            OPE.hide(this.galleryCol);
            OPE.show(this.gallerySelectedCol);
            this.createViews(selected);
        },

        backToAllPhotos: function () {
            this.isFlickrPicturesList = true;
            this.isShowGallery = false;

            OPE.show(this.galleryCol);
            OPE.hide(this.gallerySelectedCol);
        },

        // in my gallery show the picture area 
        showModal: function (config) {
            config = config || {};
            config.title = config.title || '';
            config.content = config.content || '';
            OPE.show(this.modalTemplate);
            OPE.addClass(this.modalTemplate, 'in');
            OPE.addClass(this.body, 'modal-open');
            this.modalTitle.innerHTML = config.title;
            this.modalContent.innerHTML = config.content;
        },

        hideModal: function () {
            OPE.hide(this.modalTemplate);
            OPE.removeClass(this.modalTemplate, 'in');
            OPE.removeClass(this.body, 'modal-open');
        },

        loadingShow: function () {
            OPE.show(this.loading);
        },

        loadingHide: function () {
            OPE.hide(this.loading);
        },

        emptymsgShow: function () {
            OPE.show(this.emptymsg);
        },

        emptymsgHide: function () {
            OPE.hide(this.emptymsg);
        },

        gallerymsgShow: function () {
            OPE.show(this.gallerymsg);
        },

        gallerymsgHide: function () {
            OPE.hide(this.gallerymsg);
        }
    };

})();


// temp functions 
(function () {
    'start';


    OPE.Ajax = function (ob) {
        var callback, config, xmlhttp, httpType, link;

        config = ob || {};
        xmlhttp = new XMLHttpRequest();
        httpType = config.type || 'GET';
        link = config.url || null;
        callback = config.callback || null;

        if (typeof link != 'string') {
            throw new Error('Empty url')
        }

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    if (typeof callback == 'function') {
                        callback.call(this, xmlhttp.response);
                    }
                }
                else if (xmlhttp.status == 400) {
                    throw new Error('There was an error 400');
                }
                else {
                    throw new Error('Something else other than 200 was returned');
                }
            }
        };

        xmlhttp.open(httpType, link, true);
        xmlhttp.send();
    }


    OPE.$ = function (sel) {
        var elm = document.querySelectorAll(sel);
        return elm.length > 1 ? elm : elm[0];
    };

    OPE.nodeToString = function (node) {
        var div = document.createElement('div');
        div.appendChild(node);
        return div.innerHTML;
    };

    //display unmatch search item message page 
    OPE.toggleClass = function (sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');
        if (re.test(currentClass)) {
            currentClass = currentClass.replace(re, '');
        } else {
            currentClass = currentClass + ' ' + className;
        }
        sel.className = currentClass;
        return sel;
    };

    // temp Methods 
    OPE.hasClass = function (sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        return re.test(currentClass);
    };

    OPE.addClass = function (sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        if (!OPE.hasClass(sel, className)) {
            currentClass = currentClass + ' ' + className;
        }

        sel.className = currentClass;
        return sel;
    };

    //Show all picture and scroll down in first page 
    OPE.removeClass = function (sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        if (OPE.hasClass(sel, className)) {
            currentClass = currentClass.replace(re, '');
        }

        sel.className = currentClass;
        return sel;
    };

    OPE.show = function (sel) {
        sel.style.display = 'block';
        return sel;
    };

    OPE.hide = function (sel) {
        sel.style.display = 'none';
        return sel;
    };

    OPE.plural = function (count, word) {
        return count > 1 ? word + 's' : word;
    };

    OPE.escapeTags = function (text) {
        return text.replace(/<(?:.|\n)*?>/gm, '').replace(/</gm, '').replace(/>/gm, '');
    };

    OPE.escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    OPE.addSlashes = function (str) {
        str = OPE.escapeTags(str);
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    };

    OPE.Events = {
        on: function (sel, ev, fn, innerEl) {
            var el;

            if (typeof sel == 'string') {
                el = OPE.$(sel);
            } else {
                el = sel;
            }

            if (innerEl) {
                el.addEventListener(ev, function (e) {
                    if (e.target.tagName.toLowerCase() == innerEl) {
                        fn.call(this, e, e.target);
                    }
                });
            } else {
                el.addEventListener(ev, fn);
            }
        }
    };


})();

OPE.Flickr.init();