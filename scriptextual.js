var stx = {
  i: function(s) { return parseInt(s.replace(/^0/, '')) },
  duration: function(line) {
    var parts = line.match(stx.patterns.duration);
    var bounds = line.split('-');
    var from = stx.i(parts[1]) * 60 + stx.i(parts[2]);
    var to = stx.i(parts[3]) * 60 + stx.i(parts[4]);
    if (to < from)
      to += 1440;
    return to - from
  },
  hhmm: function(m) {
    return $.sprintf('%02d%02d', Math.floor(m / 60), m % 60);
  },
  looks_like: function(pattern) {
    
  },
  _pattern_parts: {
    date: [
      { token: '\\d{4}', capturable: true },
      { token: '-', capturable: false },
      { token: '\\d{2}', capturable: true },
      { token: '-', capturable: false },
      { token: '\\d{2}', capturable: true }
    ],
    time: [
      { token: '\\d{2}', capturable: true },
      { token: '\\d{2}', capturable: true }
    ]
  },
  _patterns: {
    duration: ['time', '-', 'time'],
    date_mark_with_sum: ['date', ' \\(', 'time', '\\)']
  }
};
stx['patterns'] = {};
for (var pattern_name in stx._patterns)
{
  var regexp = '';
  for (var i = 0; i < stx._patterns[pattern_name].length; i++)
  {
    var pattern_part = stx._patterns[pattern_name][i];
    if (stx._pattern_parts[pattern_part])
    {
      for (var j = 0; j < stx._pattern_parts[pattern_part].length; j++)
      {
        if (stx._pattern_parts[pattern_part][j].capturable)
          regexp += '(';
        regexp += stx._pattern_parts[pattern_part][j].token;
        if (stx._pattern_parts[pattern_part][j].capturable)
          regexp += ')';
      }
    }
    else
      regexp += pattern_part;
  }
  stx.patterns[pattern_name] = new RegExp(regexp)
}

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
    description: 'Remove line numbers and all necessary spaces between numbers and text for proper alignment',
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
    scrollDown: true,
    call: function(text) {
      var blocks = text.split(/\n\n/);
      var date = new Date();
      var date_mark = $.sprintf('%04d-%02d-%02d', date.getYear() + 1900, date.getMonth() + 1, date.getDate());
      return text + '\n' + date_mark;
    }
  },
  func_toggle_status: {
    description: 'Toggle status, i.e. add start mark when idle, add stop mark when working',
    scrollDown: true,
    call: function(text) {
      var lines = text.split(/\n/);
      var date = new Date();
      var mark = $.sprintf('%02d%02d', date.getHours(), date.getMinutes());
      if (!/^\d+-$/.test(lines[lines.length - 1]))
        mark = '\n' + mark + '-';
      return text + mark;
    }
  },
  func_calculcate_sums: {
    description: 'Calculate daily sums and put them in parentheses next to the date marks',
    scrollDown: true,
    call: function(text) {
      var blocks = text.split(/\n\n/);
      for (var i = 0; i < blocks.length; i++)
      {
        var block_lines = blocks[i].split(/\n/);
        if (!stx.patterns.date_mark_with_sum.test(block_lines[0]))
        {
          var minutes = 0;
          for (var j = 1; j < block_lines.length; j++)
            minutes += stx.duration(block_lines[j]);
          block_lines[0] += ' (' + stx.hhmm(minutes) + ')';
          blocks[i] = block_lines.join('\n');
        }
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
      if (functions[$(this).data('function_name')]['scrollDown'])
        $('#' + params.workbench).attr('scrollTop', $('#' + params.workbench).attr('scrollHeight'));
    }));
    $('#' + params.handle_box).append(function_list);
  }
}
