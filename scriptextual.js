var stx = {
  i: function(s) { return parseInt(s.replace(/^0/, '')) },
  duration: function(line) {
    var parts = line.match(/(\d{2})(\d{2})-(\d{2})(\d{2})/);
    var bounds = line.split('-');
    var from = stx.i(parts[1]) * 60 + stx.i(parts[2]);
    var to = stx.i(parts[3]) * 60 + stx.i(parts[4]);
    if (to < from)
      to += 1440;
    return to - from
  },
  hhmm: function(m) {
    return $.sprintf('%02d%02d', Math.floor(m / 60), m % 60);
  }
};

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
      var lines = text.split(/\n/);
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
  },
  func_remove_line_numbers: {
    description: 'Add line numbers and all necessary spaces between numbers and text for proper alignment',
    call: function(text) {
      var lines = text.split(/\n/);
      for (var i = 0; i < lines.length; i++)
      {
        lines[i] = lines[i].replace(/^\d+\s+/, '');
      }
      return lines.join('\n');
    }
  },
  func_add_date_mark: {
    description: 'Append a time-tracking block for the current day',
    call: function(text) {
      var blocks = text.split(/\n\n/);
      var date = new Date();
      var date_mark = $.sprintf('%04d-%02d-%02d', date.getYear() + 1900, date.getMonth() + 1, date.getDate());
      return text + '\n' + date_mark + '\n';
    }
  },
  func_toggle_status: {
    description: 'Toggle status, i.e. add start mark when idle, add stop mark when working',
    call: function(text) {
      var lines = text.split(/\n/);
      var date = new Date();
      var mark = $.sprintf('%02d%02d', date.getHours(), date.getMinutes());
      mark += lines[lines.length - 1].match(/^\d+-$/) ? '\n' : '-';
      return text + mark;
    }
  },
  func_calculcate_sums: {
    description: 'Calculate daily sums and put them in parentheses next to the date marks',
    call: function(text) {
      var blocks = text.split(/\n\n/);
      for (var i = 0; i < blocks.length; i++)
      {
        var minutes = 0;
        var block_lines = blocks[i].split(/\n/);
        for (var j = 1; j < block_lines.length; j++)
          minutes += stx.duration(block_lines[j]);
        block_lines[0] += ' (' + stx.hhmm(minutes) + ')';
        blocks[i] = block_lines.join('\n');
      }
      return blocks.join('\n\n');
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