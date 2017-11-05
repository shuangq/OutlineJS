# OutlineJS
OutlineJS is a simple plugin to generate outline automatically for a html file converted by markdown file.

## Feature
* Automatically extract headers from the article and generate an outline.
* Click on the title in the outline, the page will jump to the specific chapter.
* Title of the current chapter will be highlighted as you scroll to view the article.

## Documentation
### Usage
OutlineJS does not require other libraries, so just place the following &lt;script&gt; near the end of your page, right before the closing </body> tag, to enable it.
```html
<script src="./src/outline.js"></script>
```

Don't forget to include the CSS file in &lt;head&gt; as well:
```html
<link rel="stylesheet" type="text/css" href="./src/outline.css">   
```

If you need to customize the outline, you can change the value by calling the function in this way:
```javascript
Outline({
    ifList: false,
    ifSmooth: true
    ...
});
```

### Options
Following are the options and their default values:

* **outlId {String}**  
The id of the oultine container.
default：'myOutline'

* **outlClass {String}**  
The class name of the outline container.
default：'my-outline'

* **outlWidth {Number}**  
The width of the outline.
default：250

* **ifFold {Boolean}**  
Whether to fold the outline when initialized.  
default：false

* **wrapCLass {String}**
The class name of the container wrapping the article.
default：'my-wrap'

* **ifSmooth {Boolean}**  
When set to true, the page will scroll smoothly to the chapter when clicking the title.  
default：false

* **duration {Number}**  
The speed of scrolling. (Only enable when ifSmooth is set to true.)  
default：60

* **ifList {Boolean}**  
Whether to consider list in the article when generating the outline.
default： false
