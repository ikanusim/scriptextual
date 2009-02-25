var functions = {
  func_strip_whitespace_in_lines: {
    description: 'Remove leading and trailing whitespace in each line',
    call: function(text) {
      var lines = text.split(/\n/);
      for (var i = 0; i < lines.length; i++)
      {
        lines[i] = lines[i].replace(/^\s+/, '').replace(/\s+$/, '');
      }
      return lines.join('\n');
    }
  },
  func_add_line_numbers: {
    description: 'Add line numbers and all necessary spaces between numbers and text for proper alignment',
    call: function(text) {
      lines = text.split(/\n/);
      var digits = Math.ceil(Math.log(lines.length) / Math.LN10);
      for (var i = 0; i < lines.length; i++)
      {
        var prefix = (i + 1).toString();
        while (prefix.length < digits + 1)
        prefix += ' ';
        lines[i] = prefix + lines[i];
      }
      return lines.join('\n');
    }
  }
};

function init_scriptextual(params)
{
  var function_list = $(document.createElement('ul'));
  for (var function_name in functions)
  {
    function_list.append($(document.createElement('li')).text(functions[function_name].description).data('function_name', function_name).click(function() {
      $('#' + params.workbench).val(functions[$(this).data('function_name')].call($('#' + params.workbench).val()));
    }));
    $('#' + params.handle_box).append(function_list);
  }
}