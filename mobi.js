/**
 * Data
 */
var data = {
	default: 9,
	mobile: 20,
	mobileChromeHeight: 0,
	breakpoint: 600,
	usemobile: false,
	offset: 0,
	offsetCalc: 0,
	padding: 0,
	chromeHeight: 0,
	widthunit: '',
	contentPosition: '',
	winHeight: 0,
	winWidth: 0
}

var $el = { }

$(function () {
	$el = {
		body: $('body'),
		html: $('html'),
		main: $('main'),
		contrent_ruler: $('[data-content-ruler]'),
		content_padded: $('.content_padded'),
		container_padding: $('[data-container-padding]')
	}

	Cargo.Event.trigger('design:ready');
});

/**
 * Set Unit
 */
function setUnit () {
	var _weight = data.default;
	var _scale = data.mobile - 15;
	var _padding = data.padding;
	var _offset = data.offset;
	var _diff = 0;
	var _size = 0;

	// Aspect ratio difference
	if (data.winHeight > data.winWidth) {
		_diff = data.winHeight / data.winWidth - 1;
	} else {
		_diff = 0;
	}

	// Ratio
	_diff = (_diff / 0.777777778) * 1;

	// iPhone vertical  orientation ratio
	if (_diff > 1) {
		_diff = 1;
	}

	// Padding offset
	_offset = Math.abs(_offset) / 10;
	_offset = (_padding * _offset) * _diff * -1;
	data.offsetCalc = _offset + 'rem';

	// If we're mobile, add class
	if (data.usemobile) {
		if (Math.abs(_diff) > 0 || useMobileForce()) {
	  		enableMobile();
		} else {
			disableMobile();
		}
	} else {
		disableMobile();
	}

	// Mobile
	if (Math.abs(_diff) > 0) {
  		$el.container_padding.css({
  			margin: _offset + 'rem'
  		});
	} else {
		$el.container_padding.css('margin', '');
	}

	// Base unit
	_size = Cargo.Plugins.baseUnit({
		weight: _weight + (_scale * _diff)
	});

	// Set the size
	if (_size < 20) {
		_size = 20;
	}

	$el.html.css('font-size', _size + '%');
	Cargo.Event.trigger('set_baseunit')
};

/**
 * Enable Mobile
 */
function enableMobile () {
	$el.body.addClass('mobile');
	Cargo.Event.trigger('backdrop_matches_viewport', false);
}

/**
 * Disable Mobile
 */
function disableMobile () {
	$el.body.removeClass('mobile');
	Cargo.Event.trigger('backdrop_matches_viewport', true);
}

/**
 * Force Mobile
 */
function useMobileForce () {
	var is_fit_layout = data.contentPosition == 'left_fit' || data.contentPosition == 'right_fit';
	var	is_percentage_layout = data.widthunit == '%';
	var	main_width = $el.contrent_ruler.width() / data.winWidth * 100;

	if (is_percentage_layout || !is_fit_layout) { return false }

	if (main_width > 85) {
		return true
	} else {
		return false
	}
}

/**
 * Admin UI Updates
 */
Cargo.Event.on('handleAdminUIChange', function(name, value) {
	switch (name) {
	    case 'mobile_formatting':
			data.usemobile = value;
			setUnit();
			checkHeight();
			break;

	    case 'mobile_zoom':
			data.mobile = parseFloat(value);
			setUnit();
			checkHeight();
			break;

		case 'main_margin':
			data.padding = parseFloat(value);
			setUnit();
			checkHeight();
			break;

	    case 'mobile_padding':
			data.offset = parseFloat(value);
			setUnit();
			checkHeight();
			break;

		case 'content_position':
			data.contentPosition = value;
			setUnit();
			checkHeight();
			break;

		case 'width_unit':
			data.widthunit = value;
			setUnit();
			checkHeight();
			break;
	}
});


/**
 * Set Size
 */
function setSize () {
	if (Cargo.Helper.isMobile()) {
		if (window.innerHeight > window.innerWidth) {
			data.mobileChromeHeight = screen.height - window.innerHeight;
			data.winHeight = screen.height || window.innerHeight;
			data.winWidth = screen.width || window.innerWidth;
		} else {
			data.mobileChromeHeight = screen.width - window.innerHeight;
			data.winHeight = screen.width || window.innerHeight;
			data.winWidth = screen.height || window.innerWidth;
		}
	} else {
		data.winHeight = window.innerHeight;
		data.winWidth = window.innerWidth;
	}
}

function eventPreventDefault(e){
	e.preventDefault();
}

/**
 * Check Height
 */
function checkHeight () {
	var height = (data.winHeight - data.mobileChromeHeight) >= $el.content_padded.outerHeight();
	
	if (data.usemobile) {
		resetMobile();
		return;
	}

	if (height) {
		document.addEventListener('touchmove', eventPreventDefault);
		$el.main.css({
			position: 'fixed',
			top: 0,
			bottom: 0,
			minHeight: 0
		});
	} else {
		resetMobile();
	}
}

/**
 * Reset Mobile
 */
function resetMobile () {
	document.removeEventListener('touchmove', eventPreventDefault);
	$el.main.css({
		position: '',
		top: '',
		left: '',
		right: '',
		bottom: '',
		minHeight: ''
	});
}

/**
 * Set the defaults for the mobile design
 */
function setMobileDefaults () {
	var layout_options = Cargo.Model.DisplayOptions.get('layout_options');
		_.each(layout_options, function(name, value) {
		Cargo.Event.trigger('handleAdminUIChange', name, value);
	});
}

/**
 * Refresh
 */
function refresh () {
	setUnit();
	checkHeight();
}

/**
 * Initialize
 */
function initialize () {
	var zoom = Cargo.Model.DisplayOptions.get('layout_options').mobile_zoom;
	var offset = Cargo.Model.DisplayOptions.get('layout_options').mobile_padding;
	var padding = Cargo.Model.DisplayOptions.get('layout_options').main_margin;
	var mobile = Cargo.Model.DisplayOptions.get('layout_options').mobile_formatting;
	var contentPosition = Cargo.Model.DisplayOptions.get('layout_options').content_position;
	var widthunit = Cargo.Model.DisplayOptions.get('layout_options').width_unit;

	if (zoom) {
		data.mobile = parseFloat(zoom);
	}

	if (offset) {
		data.offset = parseFloat(offset);
	}

	if (padding) {
		data.padding = parseFloat(padding);
	}

	if (mobile) {
		data.usemobile = mobile;
	}

	if (contentPosition) {
		data.contentPosition = contentPosition;
	}

	if (widthunit) {
		data.widthunit = widthunit;
	}

	var resizeEvent;

	if (Cargo.Helper.isMobile()) {
		resizeEvent = 'orientationchange';
		if (!Cargo.Helper.isIOS()) {
			// delay for mobile to make sure the resize after orientation change is complete
			setSize = _.debounce(setSize, 150);
			setUnit = _.debounce(setUnit, 150);
			checkHeight = _.debounce(checkHeight, 150);
		}
	} else {
		resizeEvent = 'resize';
	}

	$(window)
		.on(resizeEvent, setSize)
		.on(resizeEvent, setUnit)
		.on(resizeEvent, checkHeight);

	setSize();
	refresh();

	setMobileDefaults();
}

$(window).on('load', function () {
	setSize();
	refresh();

	if(typeof CargoEditor == "object" && CargoEditor.events != undefined) {
		CargoEditor.events.on('editor-summary-created', function(name) {
			refresh();
			Cargo.Plugins.elementResizer.refresh();
		});	
	}
});

/**
 * Editor Events
 */
Cargo.Event.on('design:ready', function () {

	initialize();

	Cargo.Plugins.elementResizer.refresh();

	Cargo.Event.on('editor-image-added', function(image_node) {
		refresh();
		Cargo.Plugins.elementResizer.refresh();
	});

	Cargo.Event.on('handleAdminUIChange', function(name) {
		refresh();
		Cargo.Plugins.elementResizer.refresh();
	});


	Cargo.Event.on('slideshow_update', checkHeight);
	Cargo.Event.on('page_load_complete', refresh);
});

/**
 * Element resizing 
 * 
 * 	(note: never run this in a ready callback, this needs to fire 
 * 	 before elementresizer inits.)
 */

Cargo.Event.on('element_resizer_init', function(plugin) {
    plugin.setOptions({
        cargo_refreshEvents: ['inline-editor-load-complete', 'show_index_complete', 'pagination_complete', 'page_load_complete', 'inspector_preview', 'page_collection_reset', 'direct_link_loaded', 'set_baseunit'],
        generic_refreshEvents: [],
        updateEvents: ['resize', 'onorientationchange'],
        adjustElementsToWindowHeight: false,
        centerElements: false,
        allowInit: true
    });
});