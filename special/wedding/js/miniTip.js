(function() {

  jQuery(function() {
    $.miniTip = function(element, options) {
      var content, getArrowCss, hideAnimateProperties, miniTipCss, setState, showAnimateProperties,
        _this = this;
      this.defaults = {
        position: 'top',
        event: 'hover',
        offset: 10,
        delay: 200,
        showArrow: true,
        contentType: 'attribute',
        contentAttribute: 'title',
        contentSelector: '',
        showSpeed: 350,
        hideSpeed: 250,
        showEasing: '',
        hideEasing: '',
        className: '',
        showAnimateProperties: {},
        hideAnimateProperties: {},
        onLoad: function() {},
        onVisible: function() {},
        onHide: function() {},
        onHidden: function() {}
      };
      content = '';
      miniTipCss = {
        display: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 1,
        'z-index': 99999
      };
      showAnimateProperties = {
        opacity: 1
      };
      hideAnimateProperties = {
        opacity: 0
      };
      this.settings = {};
      this.$element = $(element);
      this.state = 'hidden';
      setState = function(state) {
        _this.state = state;
      };
      getArrowCss = function() {
        var arrowCss, position, _arrowCss, _borderColor, _left, _shadowBorderColor, _shadowCss;
        arrowCss = {};
        arrowCss['arrow'] = {
          position: 'absolute',
          height: 0,
          width: 0,
          border: '6px solid transparent'
        };
        position = _this.getSetting('position');
        _arrowCss = _shadowCss = {};
        _shadowBorderColor = _this.$miniTipContent.css('border-color');
        _borderColor = _this.$miniTipContent.css('background-color');
        switch (position) {
          case "left":
            _arrowCss = {
              'right': '-11px',
              'top': '7px',
              'border-left-color': _borderColor
            };
            _shadowCss = {
              'right': '-14px',
              'border-left-color': _shadowBorderColor,
              'top': '6px'
            };
            break;
          case "right":
            _arrowCss = {
              'left': '-11px',
              'top': '7px',
              'border-right-color': _borderColor
            };
            _shadowCss = {
              'left': '-14px',
              'border-right-color': _shadowBorderColor,
              'top': '6px'
            };
            break;
          case "bottom":
            _left = _this.$miniTip.outerWidth() < _this.$element.outerWidth() ? Math.floor(_this.$miniTip.outerWidth() / 5) : Math.floor(_this.$element.outerWidth() / 5);
            _arrowCss = {
              'top': '-11px',
              'left': _left + 'px',
              'border-bottom-color': _borderColor
            };
            _shadowCss = {
              'top': '-14px',
              'border-bottom-color': _shadowBorderColor,
              'left': (_left - 1) + 'px'
            };
            break;
          default:
            _left = _this.$miniTip.outerWidth() < _this.$element.outerWidth() ? Math.floor(_this.$miniTip.outerWidth() / 5) : Math.floor(_this.$element.outerWidth() / 5);
            _arrowCss = {
              'bottom': '-11px',
              'left': _left + 'px',
              'border-top-color': '#f4f4f3'
            };
            _shadowCss = {
              'bottom': '-14px',
              'border-top-color': _shadowBorderColor,
              'left': (_left - 1) + 'px'
            };
        }
        arrowCss['arrow'] = $.extend({}, arrowCss['arrow'], _arrowCss);
        arrowCss['shadow'] = $.extend({}, arrowCss['arrow'], {
          'border-width': '7px',
          'opacity': '0.20'
        }, _shadowCss);
        return arrowCss;
      };
      this.getSetting = function(settingKey) {
        return this.settings[settingKey];
      };
      this.callSettingFunction = function(functionName) {
        return this.settings[functionName](element, this.$miniTip[0]);
      };
      this.getContent = function() {
        return content;
      };
      this.setContent = function(_content) {
        return content = _content;
      };
      this.updateMiniTipContent = function() {
        return this.$miniTipContent.html($.trim(this.getContent()));
      };
      this.getPosition = function() {
        var coordinates, position;
        position = this.getSetting('position');
        coordinates = this.$element.offset();
        switch (position) {
          case "bottom":
            coordinates['top'] = coordinates.top + this.$element.outerHeight() + this.getSetting('offset');
            break;
          case "left":
            coordinates['left'] = coordinates.left - this.$miniTip.outerWidth() - this.getSetting('offset');
            coordinates['top'] -= 5;
            break;
          case "right":
            coordinates['left'] = coordinates.left + this.$element.outerWidth() + this.getSetting('offset');
            coordinates['top'] -= 5;
            break;
          default:
            coordinates['top'] = coordinates.top - this.$miniTip.outerHeight() - this.getSetting('offset');
        }
        return coordinates;
      };
      this.updatePosition = function() {
        return _this.$miniTip.css(_this.getPosition());
      };
      this.show = function() {
        var _this = this;
        if (this.state === 'hidden' || this.state === 'hiding') {
          this.callSettingFunction('onLoad');
          setState('showing');
          return this.$miniTip.stop(true, true).css('opacity', 0).show().animate(showAnimateProperties, this.getSetting('showSpeed'), this.getSetting('showEasing'), function() {
            if (_this.state === 'showing') {
              _this.$miniTip.show();
              _this.callSettingFunction('onVisible');
              return setState('visible');
            }
          });
        }
      };
      this.hide = function() {
        var _this = this;
        if (this.state === 'visible' || this.state === 'showing') {
          this.callSettingFunction('onHide');
          setState('hiding');
          return this.$miniTip.stop(true, true).animate(hideAnimateProperties, this.getSetting('hideSpeed'), this.getSetting('hideEasing'), function() {
            if (_this.state === 'hiding') {
              _this.$miniTip.hide();
              _this.callSettingFunction('onHidden');
              return setState('hidden');
            }
          });
        }
      };
      this.init = function() {
        var $miniTipArrow, $miniTipArrowShadow, arrowCss, _hover,
          _this = this;
        this.settings = $.extend({}, this.defaults, options);
        this.$miniTipContent = $('<div />', {
          'class': 'minitip-content'
        });
        this.$miniTip = $('<div />', {
          'class': 'minitip ' + this.getSetting('className'),
          'css': miniTipCss
        }).html(this.$miniTipContent).appendTo('body');
        if (this.getSetting('showArrow')) {
          $miniTipArrow = $('<span />', {
            'class': 'minitip-arrow'
          });
          $miniTipArrowShadow = $('<span />', {
            'class': 'minitip-arrow-shadow'
          });
          this.$miniTip.append($miniTipArrowShadow).append($miniTipArrow);
        }
        if (this.getSetting('contentType') === 'selector') {
          this.setContent(this.$element.find(this.getSetting('contentSelector')).html());
        } else {
          this.setContent(this.$element.attr(this.getSetting('contentAttribute')));
          this.$element.attr(this.getSetting('contentAttribute'), '');
        }
        if (!(this.getContent() != null)) {
          return this(false);
        } else {
          this.updateMiniTipContent();
        }
        if (this.getSetting('showArrow')) {
          arrowCss = getArrowCss();
          $miniTipArrow.css(arrowCss['arrow']);
          $miniTipArrowShadow.css(arrowCss['shadow']);
        }
        ($(window)).resize(this.updatePosition);
        showAnimateProperties = $.extend(showAnimateProperties, this.getSetting('showAnimateProperties'));
        hideAnimateProperties = $.extend(hideAnimateProperties, this.getSetting('hideAnimateProperties'));
        if (this.getSetting('event') === 'hover') {
          _hover = false;
          return this.$element.hover((function() {
            _hover = true;
            _this.updatePosition();
            return setTimeout(function() {
              if (_hover) {
                return _this.show();
              }
            }, _this.getSetting('delay'));
          }), (function() {
            _hover = false;
            return _this.hide();
          }));
        } else {
          return this.$element.bind('click', function() {
            _this.updatePosition();
            _this.show();
            return window.setTimeout(function() {
              return _this.hide();
            }, _this.getSetting('delay'));
          });
        }
      };
      this.init();
      return this;
    };
    return $.fn.miniTip = function(options) {
      return this.each(function() {
        var miniTip;
        if (void 0 === ($(this)).data('minTip')) {
          miniTip = new $.miniTip(this, options);
          return ($(this)).data('minTip', miniTip);
        }
      });
    };
  });

}).call(this);
