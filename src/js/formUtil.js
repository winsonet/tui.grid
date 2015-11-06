/**
 * @fileoverview Utilities for form data, form element
 * @author NHN Ent. Fe Development Team
 */
'use strict';

/**
 * @module formUtil
 */
var formUtil = {
    /**
     * form 의 input 요소 값을 설정하기 위한 객체
     * @alias form.setInput
     * @memberof module:util
     */
    setInput: {
        /**
         * 배열의 값들을 전부 String 타입으로 변환한다.
         * @memberof module:util
         * @private
         * @alias form.setInput['_changeToStringInArray']
         * @param {Array}  arr 변환할 배열
         * @return {Array} 변환된 배열 결과 값
         */
        '_changeToStringInArray': function(arr) {
            tui.util.forEach(arr, function(value, i) {
                arr[i] = String(value);
            }, this);
            return arr;
        },

        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @memberof module:util
         * @alias form.setInput['radio']
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'radio': function(targetElement, formValue) {
            targetElement.checked = (targetElement.value === formValue);
        },

        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @memberof module:util
         * @alias form.setInput.checkbox
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'checkbox': function(targetElement, formValue) {
            if (tui.util.isArray(formValue)) {
                targetElement.checked = $.inArray(targetElement.value, this._changeToStringInArray(formValue)) !== -1;
            } else {
                targetElement.checked = (targetElement.value === formValue);
            }
        },

        /**
         * select-one type 의 input 요소의 값을 설정한다.
         * @memberof module:util
         * @alias form.setInput['select-one']
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'select-one': function(targetElement, formValue) {
            var options = tui.util.toArray(targetElement.options),
                index = -1;

            tui.util.forEach(options, function(targetOption, i) {
                if (targetOption.value === formValue || targetOption.text === formValue) {
                    index = i;
                    return false;
                }
            }, this);

            targetElement.selectedIndex = index;
        },

        /**
         * select-multiple type 의 input 요소의 값을 설정한다.
         * @memberof module:util
         * @alias form.setinput['select-multiple']
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'select-multiple': function(targetElement, formValue) {
            var options = tui.util.toArray(targetElement.options);

            if (tui.util.isArray(formValue)) {
                formValue = this._changeToStringInArray(formValue);
                tui.util.forEach(options, function(targetOption) {
                    targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                    $.inArray(targetOption.text, formValue) !== -1;
                }, this);
            } else {
                this['select-one'].apply(this, arguments);
            }
        },

        /**
         * input 요소의 값을 설정하는 default 로직
         * @memberof module:util
         * @alias form.setinput['defaultAction']
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'defaultAction': function(targetElement, formValue) {
            targetElement.value = formValue;
        }
    },

    /**
     * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
     * @memberof module:util
     * @alias form.getFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
     **/
    getFormData: function($form) {
        var result = {},
            valueList = $form.serializeArray();

        tui.util.forEach(valueList, function(obj) {
            var value = obj.value,
                name = obj.name;
            if (tui.util.isExisty(result[name])) {
                if (!result[name].push) {
                    result[name] = [result[name]];
                }
                result[name].push(value || '');
            } else {
                result[name] = value || '';
            }
        }, this);

        return result;
    },

    /**
     * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
     * @memberof module:util
     * @alias form.getFormElement
     * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
     * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
     */
    getFormElement: function($form, elementName) {
        var formElement;
        if ($form && $form.length) {
            if (elementName) {
                formElement = $form.prop('elements')[elementName + ''];
            } else {
                formElement = $form.prop('elements');
            }
        }
        return $(formElement);
    },

    /**
     * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
     * @memberof module:util
     * @alias form.setFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {Object} formData 폼에 설정할 폼 데이터 객체
     **/
    setFormData: function($form, formData) {
        tui.util.forEachOwnProperties(formData, function(value, property) {
            this.setFormElementValue($form, property, value);
        }, this);
    },

    /**
     * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
     * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
     * @memberof module:util
     * @alias form.setFormElementValue
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
     * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
     **/
    setFormElementValue: function($form, elementName, formValue) {
        var type,
            elementList = this.getFormElement($form, elementName);

        if (!elementList) {
            return;
        }
        if (!tui.util.isArray(formValue)) {
            formValue = String(formValue);
        }
        elementList = tui.util.isHTMLTag(elementList) ? [elementList] : elementList;
        elementList = tui.util.toArray(elementList);
        tui.util.forEach(elementList, function(targetElement) {
            type = this.setInput[targetElement.type] ? targetElement.type : 'defaultAction';
            this.setInput[type](targetElement, formValue);
        }, this);
    },

    /**
     * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
     * @memberof module:util
     * @alias form.setCursorToEnd
     * @param {HTMLElement} target HTML input 엘리먼트
     */
    setCursorToEnd: function(target) {
        var length = target.value.length,
            range;

        target.focus();
        if (target.setSelectionRange) {
            try {
                target.setSelectionRange(length, length);
            } catch (e) {
                // to prevent unspecified error in IE (occurs when running test)
            }
        } else if (target.createTextRange) {
            range = target.createTextRange();
            range.collapse(true);
            range.moveEnd('character', length);
            range.moveStart('character', length);
            try {
                range.select();
            } catch (e) {
                // to prevent unspecified error in IE (occurs when running test)
            }
        }
    }
};

module.exports = formUtil;

