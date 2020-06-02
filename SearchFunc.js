<script>
/*
Tipue Search 7.1
Copyright (c) 2019 Tipue
Tipue Search is released under the MIT License
http://www.tipue.com/search
*/
(function($) {
     $.fn.tipuesearch = function(options) {
          var set = $.extend( {
          'contextBuffer'          : 60,
          'contextLength'          : 60,
          'contextStart'           : 90,
          'debug'                  : false,
          'descriptiveWords'       : 25,
          'footerPages'            : 3,
          'highlightTerms'         : true,
          'imageZoom'              : true,
          'minimumLength'          : 3,
          'newWindow'              : false,
          'show'                   : 10,
          'showContext'            : true,
          'showRelated'            : true,
          'showTime'               : true,
          'showTitleCount'         : true,
          'showURL'                : true,
          'wholeWords'             : true
          }, options);
          return this.each(function() {
               var tipuesearch_t_c = 0;                         
               var tipue_search_w = '';
               if (set.newWindow)
               {
                    tipue_search_w = ' target="_blank"';      
               }
               function getURLP(name)
               {
                    var locSearch = location.search;
                    var splitted = (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(locSearch)||[,""]);
                    var searchString = splitted[1].replace(/\+/g, '%20');
                    try
                    {
                         searchString = decodeURIComponent(searchString);
                    }
                    catch(e)
                    {
                         searchString = unescape(searchString);
                    }
                    return searchString || null;
               }
               if (getURLP('q'))
               {
                    $('#tipue_search_input').val(getURLP('q'));
                    getTipueSearch(0, true);
               }         
               $(this).keyup(function(event)
               {
                    if(event.keyCode == '13')
                    {
                         getTipueSearch(0, true);
                    }
               });
               function getTipueSearch(start, replace)
               {
                    window.scrollTo(0, 0);
                    var out = '';
                    var show_replace = false;
                    var show_stop = false;
                    var standard = true;
                    var c = 0;
                    var found = [];
                    var d_o = $('#tipue_search_input').val();
                    d_o = d_o.replace(/\+/g, ' ').replace(/\s\s+/g, ' ');
                    d_o = $.trim(d_o);
                    var d = d_o.toLowerCase();
                    if ((d.match("^\"") && d.match("\"$")) || (d.match("^'") && d.match("'$")))
                    {
                         standard = false;
                    }
                    var d_w = d.split(' ');
                    if (standard)
                    {
                         d = '';
                         for (var i = 0; i < d_w.length; i++)
                         {
                              var a_w = true;
                              for (var f = 0; f < tipuesearch_stop_words.length; f++)
                              {
                                   if (d_w[i] == tipuesearch_stop_words[f])
                                   {
                                        a_w = false;
                                        show_stop = true;          
                                   }
                              }
                              if (a_w)
                              {
                                   d = d + ' ' + d_w[i];
                              }
                         }
                         d = $.trim(d);
                         d_w = d.split(' ');
                    }
                    else
                    {
                         d = d.substring(1, d.length - 1);
                    }
                    if (d.length >= set.minimumLength)
                    {
                         if (standard)
                         {
                              if (replace)
                              {
                                   var d_r = d;
                                   for (var i = 0; i < d_w.length; i++)
                                   {
                                        for (var f = 0; f < tipuesearch_replace.words.length; f++)
                                        {
                                             if (d_w[i] == tipuesearch_replace.words[f].word)
                                             {
                                                  d = d.replace(d_w[i], tipuesearch_replace.words[f].replace_with);
                                                  show_replace = true;
                                             }
                                        }
                                   }
                                   d_w = d.split(' ');
                              }                   
                              var d_t = d;
                              for (var i = 0; i < d_w.length; i++)
                              {
                                   for (var f = 0; f < tipuesearch_stem.words.length; f++)
                                   {
                                        if (d_w[i] == tipuesearch_stem.words[f].word)
                                        {
                                             d_t = d_t + ' ' + tipuesearch_stem.words[f].stem;
                                        }
                                   }
                              }
                              d_w = d_t.split(' ');
                              for (var i = 0; i < tipuesearch.pages.length; i++)
                              {
                                   var score = 0;
                                   var s_t = tipuesearch.pages[i].text;
                                   for (var f = 0; f < d_w.length; f++)
                                   {
                                        if (set.wholeWords)
                                        {
                                             var pat = new RegExp('\\b' + d_w[f] + '\\b', 'gi');
                                        }
                                        else
                                        {
                                             var pat = new RegExp(d_w[f], 'gi');
                                        }
                                        if (tipuesearch.pages[i].title.search(pat) != -1)
                                        {
                                             var m_c = tipuesearch.pages[i].title.match(pat).length;
                                             score += (20 * m_c);
                                        }
                                        if (tipuesearch.pages[i].text.search(pat) != -1)
                                        {
                                             var m_c = tipuesearch.pages[i].text.match(pat).length;
                                             score += (20 * m_c);
                                        }
                                        if (tipuesearch.pages[i].tags)
                                        {
                                             if (tipuesearch.pages[i].tags.search(pat) != -1)
                                             {
                                                  var m_c = tipuesearch.pages[i].tags.match(pat).length;
                                                  score += (10 * m_c);
                                             }
                                        }
                                        if (tipuesearch.pages[i].url.search(pat) != -1)
                                        {
                                             score += 20;
                                        }
                                        if (score != 0)
                                        {
                                             for (var e = 0; e < tipuesearch_weight.weight.length; e++)
                                             {
                                                  if (tipuesearch.pages[i].url == tipuesearch_weight.weight[e].url)
                                                  {
                                                       score += tipuesearch_weight.weight[e].score;
                                                  }
                                             }
                                        }
                                        if (d_w[f].match('^-'))
                                        {
                                             pat = new RegExp(d_w[f].substring(1), 'i');
                                             if (tipuesearch.pages[i].title.search(pat) != -1 || tipuesearch.pages[i].text.search(pat) != -1 || tipuesearch.pages[i].tags.search(pat) != -1)
                                             {
                                                  score = 0;     
                                             }    
                                        }
                                   }
                                   if (score != 0)
                                   {
                                        found.push(
                                        {
                                             "score": score,
                                             "title": tipuesearch.pages[i].title,
                                             "desc": s_t,
                                             "img": tipuesearch.pages[i].img, 
                                             "url": tipuesearch.pages[i].url,
                                             "note": tipuesearch.pages[i].note
                                        });
                                        c++;                                                                   
                                   }
                              }
                         }
                         else
                         {
                              for (var i = 0; i < tipuesearch.pages.length; i++)
                              {
                                   var score = 0;
                                   var s_t = tipuesearch.pages[i].text;
                                   var pat = new RegExp(d, 'gi');
                                   if (tipuesearch.pages[i].title.search(pat) != -1)
                                   {
                                        var m_c = tipuesearch.pages[i].title.match(pat).length;
                                        score += (20 * m_c);
                                   }
                                   if (tipuesearch.pages[i].text.search(pat) != -1)
                                   {
                                        var m_c = tipuesearch.pages[i].text.match(pat).length;
                                        score += (20 * m_c);
                                   }
                                   if (tipuesearch.pages[i].tags)
                                   {
                                        if (tipuesearch.pages[i].tags.search(pat) != -1)
                                        {
                                             var m_c = tipuesearch.pages[i].tags.match(pat).length;
                                             score += (10 * m_c);
                                        }
                                   }
                                   if (tipuesearch.pages[i].url.search(pat) != -1)
                                   {
                                        score += 20;
                                   }
                                   if (score != 0)
                                   {
                                        for (var e = 0; e < tipuesearch_weight.weight.length; e++)
                                        {
                                             if (tipuesearch.pages[i].url == tipuesearch_weight.weight[e].url)
                                             {
                                                  score += tipuesearch_weight.weight[e].score;
                                             }
                                        }
                                   }
                                   if (score != 0)
                                   {
                                        found.push(
                                        {
                                             "score": score,
                                             "title": tipuesearch.pages[i].title,
                                             "desc": s_t,
                                             "img": tipuesearch.pages[i].img,
                                             "url": tipuesearch.pages[i].url,
                                             "note": tipuesearch.pages[i].note
                                        });
                                        c++;                                                                  
                                   }                              
                              }
                         }                         
                         if (c != 0)
                         {
                              if (set.showTitleCount && tipuesearch_t_c == 0)
                              {
                                   var title = document.title;
                                   document.title = '(' + c + ') ' + title;
                                   tipuesearch_t_c++;
                              }                         
                              if (c == 1)
                              {
                                   out += '<div id="tipue_search_results_count">' + tipuesearch_string_4;
                              }
                              else
                              {
                                   var c_c = c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                   out += '<div id="tipue_search_results_count">' + c_c + ' ' + tipuesearch_string_5;
                              }
                              if (set.showTime)
                              {
                                   var endTimer = new Date().getTime();
                                   var time = (endTimer - startTimer) / 1000;
                                   out += ' (' + time.toFixed(2) + ' ' + tipuesearch_string_14 + ')';
                                   set.showTime = false;
                              }
                              out += '</div>';
                              if (set.showRelated && standard)
                              {
                                   var ront = '';
                                   f = 0;
                                   for (var i = 0; i < tipuesearch_related.Related.length; i++)
                                   {
                                        if (d == tipuesearch_related.Related[i].search)
                                        {
                                             if (!f)
                                             {
                                                  out += '<div class="tipue_search_related">' + tipuesearch_string_10 + ': ';
                                             }
                                             if (show_replace)
                                             {
                                                  d_o = d;
                                             }
                                             if (tipuesearch_related.Related[i].include)
                                             {
                                                  var r_d = d_o + ' ' + tipuesearch_related.Related[i].related;
                                             }
                                             else
                                             {
                                                  var r_d = tipuesearch_related.Related[i].related;
                                             }                                             
                                             ront += '<a class="tipue_search_related_btn" id="' + r_d + '">' + tipuesearch_related.Related[i].related + '</a>, ';
                                             f++;         
                                        }
                                   }
                                   if (f)
                                   {
                                        ront = ront.slice(0, -2);
                                        ront += '.</div>';
                                        out += ront;
                                   }   
                              }
                              if (show_replace)
                              {
                                   out += '<div id="tipue_search_replace">' + tipuesearch_string_2 + ' ' + d + '. ' + tipuesearch_string_3 + ' <a id="tipue_search_replaced">' + d_r + '</a></div>';
                              }
                              found.sort(function(a, b) { return b.score - a.score } );
                              var l_o = 0;
                              if (set.imageZoom)
                              {
                                   out += '<div id="tipue_search_image_modal"><div class="tipue_search_image_close">&#10005;</div><div class="tipue_search_image_block"><a id="tipue_search_zoom_url"><img id="tipue_search_zoom_img"></a><div id="tipue_search_zoom_text"></div></div></div>';    
                              }
                              for (var i = 0; i < found.length; i++)
                              {
                                   if (l_o >= start && l_o < set.show + start)
                                   {
                                        out += '<div class="tipue_search_result">';
                                        out += '<div class="tipue_search_content_title"><a href="' + found[i].url + '"' + tipue_search_w + '>' +  found[i].title + '</a></div>';
                                        if (set.debug)
                                        {                                             
                                             out += '<div class="tipue_search_content_debug">Score: ' + found[i].score + '</div>';
                                        }
                                        if (set.showURL)
                                        {
                                             var s_u = found[i].url.toLowerCase();
                                             if (s_u.indexOf('http://') == 0)
                                             {
                                                  s_u = s_u.slice(7);
                                             }                                             
                                             out += '<div class="tipue_search_content_url"><a href="' + found[i].url + '"' + tipue_search_w + '>' + s_u + '</a></div>';
                                        }
                                        if (found[i].img)
                                        {
                                             if (set.imageZoom)
                                             {
                                                  out += '<div class="tipue_search_image"><img class="tipue_search_img tipue_search_image_zoom" src="' + found[i].img + '" alt="' + found[i].title + '" data-url="' + found[i].url + '"></div>';     
                                             }
                                             else
                                             {
                                                  out += '<div class="tipue_search_image"><a href="' + found[i].url + '"' + tipue_search_w + '><img class="tipue_search_img" src="' + found[i].img + '" alt="' + found[i].title + '"></a></div>';
                                             }
                                        }
                                        if (found[i].desc)
                                        {                                        
                                             var t = found[i].desc;
                                             if (set.showContext)
                                             {
                                                  d_w = d.split(' ');
                                                  var s_1 = found[i].desc.toLowerCase().indexOf(d_w[0]);
                                                  if (s_1 > set.contextStart)
                                                  {
                                                       var t_1 = t.substr(s_1 - set.contextBuffer);
                                                       var s_2 = t_1.indexOf(' ');
                                                       t_1 = t.substr(s_1 - set.contextBuffer + s_2);
                                                       t_1 = $.trim(t_1);
                                                       if (t_1.length > set.contextLength)
                                                       {                                                      
                                                            t = '... ' + t_1;
                                                       }
                                                  }   
                                             }
                                             if (standard)
                                             {
                                                  d_w = d.split(' ');
                                                  for (var f = 0; f < d_w.length; f++)
                                                  {
                                                       if (set.highlightTerms)
                                                       {
                                                            var patr = new RegExp('(' + d_w[f] + ')', 'gi');
                                                            t = t.replace(patr, "<h0011>$1<h0012>");
                                                       }
                                                  }
                                             }
                                             else if (set.highlightTerms)
                                             {
                                                  var patr = new RegExp('(' + d + ')', 'gi');
                                                  t = t.replace(patr, "<span class=\"tipue_search_content_bold\">$1</span>");
                                             }
                                             var t_d = '';
                                             var t_w = t.split(' ');
                                             if (t_w.length < set.descriptiveWords)
                                             {
                                                  t_d = t;
                                             }
                                             else
                                             {
                                                  for (var f = 0; f < set.descriptiveWords; f++)
                                                  {
                                                       t_d += t_w[f] + ' '; 	
                                                  }
                                             }
                                             t_d = $.trim(t_d);
                                             if (t_d.charAt(t_d.length - 1) != '.')
                                             {
                                                  t_d += ' ...';
                                             }
                                             t_d = t_d.replace(/h0011/g, 'span class=\"tipue_search_content_bold\"');
                                             t_d = t_d.replace(/h0012/g, '/span');
                                             out += '<div class="tipue_search_content_text">' + t_d + '</div>';
                                        }
                                        if (found[i].note)
                                        {
                                             out += '<div class="tipue_search_note">' + found[i].note + '</div>';    
                                        }                                       
                                        out += '</div>';
                                   }
                                   l_o++;     
                              }                              
                              if (c > set.show)
                              {
                                   var pages = Math.ceil(c / set.show);
                                   var page = (start / set.show);
                                   if (set.footerPages < 3)
                                   {
                                        set.footerPages = 3;
                                   }
                                   out += '<div id="tipue_search_foot"><ul id="tipue_search_foot_boxes">';
                                   if (start > 0)
                                   {
                                       out += '<li role="navigation"><a class="tipue_search_foot_box" accesskey="b" id="' + (start - set.show) + '_' + replace + '">' + tipuesearch_string_6 + '</a></li>'; 
                                   }
                                   if (page <= 2)
                                   {
                                        var p_b = pages;
                                        if (pages > set.footerPages)
                                        {
                                             p_b = set.footerPages;
                                        }                    
                                        for (var f = 0; f < p_b; f++)
                                        {
                                             if (f == page)
                                             {
                                                  out += '<li class="current" role="navigation">' + (f + 1) + '</li>';
                                             }
                                             else
                                             {
                                                  out += '<li role="navigation"><a class="tipue_search_foot_box" id="' + (f * set.show) + '_' + replace + '">' + (f + 1) + '</a></li>';
                                             }
                                        }
                                   }
                                   else
                                   {
                                        var p_b = page + set.footerPages - 1;
                                        if (p_b > pages)
                                        {
                                             p_b = pages; 
                                        }
                                        for (var f = page - 1; f < p_b; f++)
                                        {
                                             if (f == page)
                                             {
                                                  out += '<li class="current" role="navigation">' + (f + 1) + '</li>';
                                             }
                                             else
                                             {
                                                  out += '<li role="navigation"><a class="tipue_search_foot_box" id="' + (f * set.show) + '_' + replace + '">' + (f + 1) + '</a></li>';
                                             }
                                        }
                                   }                         
                                   if (page + 1 != pages)
                                   {
                                       out += '<li role="navigation"><a class="tipue_search_foot_box" accesskey="m" id="' + (start + set.show) + '_' + replace + '">' + tipuesearch_string_7 + '</a></li>'; 
                                   }                    
                                   out += '</ul></div>';
                              }
                         }
                         else
                         {
                              out += '<div id="tipue_search_error">' + tipuesearch_string_8 + '</div>'; 
                         }
                    }
                    else
                    {
                         if (show_stop)
                         {
                              out += '<div id="tipue_search_error">' + tipuesearch_string_8 + ' ' + tipuesearch_string_9 + '</div>';     
                         }
                         else
                         {
                              if (set.minimumLength == 1)
                              {
                                   out += '<div id="tipue_search_error">' + tipuesearch_string_11 + '</div>';
                              }
                              else
                              {
                                   out += '<div id="tipue_search_error">' + tipuesearch_string_12 + ' ' + set.minimumLength + ' ' + tipuesearch_string_13 + '</div>';
                              }
                         }
                    }                
                    $('#tipue_search_content').hide().html(out).slideDown(200);
                    $('#tipue_search_replaced').click(function()
                    {
                         getTipueSearch(0, false);
                    });
                    $('.tipue_search_related_btn').click(function()
                    {
                         $('#tipue_search_input').val($(this).attr('id'));
                         getTipueSearch(0, true);
                    });
                    $('.tipue_search_image_zoom').click(function()
                    {
                         $('#tipue_search_image_modal').fadeIn(300);
                         $('#tipue_search_zoom_img').attr('src', this.src);
                         var z_u = $(this).attr('data-url');
                         $('#tipue_search_zoom_url').attr('href', z_u);
                         var z_o = this.alt + '<div class="tipue_search_zoom_options"><a href="' + this.src + '" target="_blank">' + tipuesearch_string_15 + '</a>&nbsp; <a href="' + z_u + '">' + tipuesearch_string_16 + '</a></div>';
                         $('#tipue_search_zoom_text').html(z_o);
                    });
                    $('.tipue_search_image_close').click(function()
                    {
                         $('#tipue_search_image_modal').fadeOut(300);
                    });                
                    $('.tipue_search_foot_box').click(function()
                    {
                         var id_v = $(this).attr('id');
                         var id_a = id_v.split('_');
                         getTipueSearch(parseInt(id_a[0]), id_a[1]);
                    });                                                       
               }          
          });
     };
})(jQuery);
</script>

<script>
var tipuesearch = {"pages": [
  {"title":"Cubeware Home","text":"Accelerate business value through data.","url":"https://www.cubeware.co/home"},
  {"title":"Why Cubeware", "text": "Cubeware in a nutshell.", "url": "https://www.cubeware.co/why-cubeware"},
  {"title":"Solutions","text":"Performance Management & Business Intelligence Solutions For Your Success.","url":"https://www.cubeware.co/solutions"},
  {"title":"Demo","text":"Business intelligence for your company evaluate the popular BI Frontend.","url":"https://www.cubeware.co/demo"},
  {"title":"Cubeware Portal","text":"Sign in to Cubeware Portal Our portal is where Cubeware Partners and direct Cubeware customers will find information and documents, access to the online ticketing system as well as software and release downloads.","url":"https://www.cubeware.co/portal"},
  {"title":"Cubeware Contact","text":"How can we help? Drop us a message.","url":"https://www.cubeware.co/contact"},
  {"title":"Live Training","text":"For all those who want to use Cubeware software from scratch, train new employees or refresh their knowledge","url":"https://www.cubeware.co/resources"},
  {"title":"Whitepaper SAP BW & Cubeware","text":"Use Cubeware Products As Powerful Front Ends For SAP Business Warehouse.","url":"https://www.cubeware.co/whitepaper"},
  {"title":"News Blog","text":"Detailed information about our company and business intelligence.","url":"https://www.cubeware.co/news-blog"},
  {"title":"BARC STUDY","text":"Predictive planning & forecasting.","url":"https://www.cubeware.co/barc-planning"},
  {"title":"Imprint","text":"Exclusion of liability and statutory references.","url":"https://www.cubeware.co/imprint"},
  {"title":"General And Software Terms","text":"In the following list you can download our general and software terms.","url":"https://www.cubeware.co/general-and-software-terms"},
  {"title":"Cubeware Privacy Statement","text":'The protection of the personel data of the users of our website and of our customers is very important to us. This Privacy Statement explains out to data protection and privacy. This Privacy Statement outlines how we handle information that can be used to directly or indirectly identify an individual ("Personal Data").',"url":"https://www.cubeware.co/data-privacy"},
  {"title":"Product Overview","text":"Operating a BI System successfully depends on more than one factor.","url":"https://www.cubeware.co/overview"},
  {"title":"Cockpit","text":"Discover our high-end frontend for stationary and web-based work.","url":"https://www.cubeware.co/cockpit"},
  {"title":"Mobile","text":"The mobile BI frontend for everyone on the go and all smartphone and tablet enthusiasts.","url":"https://www.cubeware.co/mobile"},
  {"title":"Snack","text":"With its unique BI architecture, our platform offers the right server for every BI solution and every BI project.","url":"https://www.cubeware.co/snack"},
  {"title":"Server","text":"With its unique BI architecture, our platform offers the right server for every BI solution and every BI project.","url":"https://www.cubeware.co/server"},
  {"title":"CW1 Database","text":"By default, we use the most powerful MOLAP database in the world as an analysis engine for our solutions.","url":"https://www.cubeware.co/cw1-database"},
  {"title":"OLAP Database","text":"We have the right database for every project - hybrid scenarios are also possible. That is our best-of-breed concept.","url":"https://www.cubeware.co/olap-databases"},
  {"title":"Importer","text":"The powerful ETL tool in the CSP. Data Management Software in Perfection.","url":"https://www.cubeware.co/importer"},
  {"title":"Brochures","text":"","url":"https://www.cubeware.co/brochures"},
  {"title":"Case Studies","text":"","url":"https://www.cubeware.co/case-studies"},
	{"title":"Manufacturing","text":"Saturated markets demand innovation, skilled workers are scarce as product complexity grows and demand changes constantly. Manufacturers need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/manufacturing"},
  {"title":"Logistic & Transportation","text":"From road freight transport to the use of driver-less conveyor systems in the smart factory: the logistics sector has many facets. While the benefits of the Internet of Things call, the pressures of rising fuel and freight costs rise. Logistics and transportation businesses need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimize processes, maximize margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/logistic-transportation"},
  {"title":"Public & Administration","text":"Municipal and state administrative bodies provide the public with a wide range of services – with the network becoming ever more close-knit while budgets shrink. Educational institutions are assuming huge importance in our knowledge-based economy. Administrative bodies need now more than ever an intelligent view of their collected data in order to decide how to deliver services efficiently, to prevent waste and fraud and to address the future needs of citizens and residents.","url":"https://www.cubeware.co/public-administration"},
  {"title":"Agriculture & Forestry","text":"Agricultural and forestry companies operate in demanding markets. Besides digitalisation and increasing expectations from consumers, escalating intervention on the part of food retailers in production is also causing disruption. Agricultural and forestry businesses need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/agriculture-forestry"},
  {"title":"Mining","text":"Economic leeway in the mining industry is extremely restricted. Digital change is having a significant impact from the mine to the port of lading. At the same time, environmental regulations are continuing to grow. Mining businesses need – now more than ever – an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/mining"},
  {"title":"Wholesale & Retail Trade","text":"Competition has never been tougher. Sales channels – online and on mobile devices – are exerting additional pressure on retailers and wholesalers alike. Remaining relevant in this environment is harder than ever before. Wholesale and retail businesses need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/whosale-retail"},
  {"title":"Financial Sector","text":"Companies in the financial sector are permanently exposed to events that exert an influence on all areas of the business. Digitalisation is speeding up business, too. Acting strategically, intelligently is more demanding than ever. Banks, insurance companies and financial service providers need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/financial"},
  {"title":"Service Providers","text":"The world is spinning ever faster for management, tax, legal and IT consultants and their clients. Managing a business consisting of complex projects is extremely demanding. Services providers need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/service-providers"},
  {"title":"Construction Industry","text":"The construction industry is booming. Many companies have countless construction sites. At the same time, technical demands in the form of energy efficiency or smart home are increasing incessantly. Construction businesses need now more than ever an intelligent view of their business data in order to identify new business opportunities, optimise processes, maximise margins, offer outstanding customer service and create space for genuine innovation.","url":"https://www.cubeware.co/construction-industry"},
  {"title":"Human Resources","text":"Lists with commencement and termination data, the database with personnel costs, information on recruitment campaigns, time attendance systems, countless spreadsheets. Data for human resources are located across a large number of different systems and data sources. There is a great deal of manual processing and no overall view of things. Be careful: a lot of decisions are left to gut instincts.","url":"https://www.cubeware.co/humanresource_industry"},
  {"title":"Sales & Distribution","text":"The CRM system, e-commerce analysis, support list, demographic evaluation, countless spreadsheets ... Data for sales and distribution are located across a large number of different systems and data sources. However, a broad view of the pipeline is very often missing. Sales experts lose a great deal of time struggling to find the data they need. Be careful: this means sales opportunities are going to waste.","url":"https://www.cubeware.co/sales_distribution"},
  {"title":"IT & Technology","text":"The CRM system, ERP system, CSV files data from external service providers, countless spreadsheets. IT data for your company are located across a large number of different systems and data sources. A main part of the work in your department is spent on maintaining, consolidating and supporting employees in your IT infrastructure. Initiatives, concepts and work on new digital business models disappear in the flood of daily operations.","url":"https://www.cubeware.co/information-technology"},
  {"title":"Executive Board & Management","text":"The purchasing database, production list, analyses from sales and marketing, the CRM system, countless spreadsheets. Where managers and executives need meaningful performance data there is mostly only a jumble of data from different systems and data sources . Instead of being able to take well-informed decisions, managers are pressed for time and have to translate confusing tables into insight and decisions.","url":"https://www.cubeware.co/executive-board-management"},
  {"title":"Research & Development","text":"Compliance information, IoT parameters, data on customer demographics, technical specifications, countless spreadsheets – data for research & development are located across a large number of different systems and data sources. Single point of truth? Forget it! And then there are the permanent project and cost pressures. Be careful: having to perform countless operational activities means that project management and strategic controlling suffer.","url":"https://www.cubeware.co/research-development"},
  {"title":"Manufacturing & Production","text":"The ERP system, CRM system, MES tool, details on new production processes, countless spreadsheets – data for manufacturing and production are located across a large number of different systems and data sources. They are still very often collated manually, which means a great deal of arduous work in creating weekly and monthly reports. To say nothing of ad hoc evaluations. Be careful: potential efficiency gains are going to waste!","url":"https://www.cubeware.co/manufacturing-production"},
  {"title":"Finance Controlling & Accounting","text":"Revenues for each business unit, evidence about market share, the ERP system, cash flow information, countless spreadsheets – data for financial controlling are located across a large number of different systems and data sources. Monthly financial reporting – even today – still involves a struggle with disparate data and information. And the budget planning process that builds on this blocks important resources for weeks on end. ","url":"https://www.cubeware.co/finance-accounting"},
  {"title":"Procurement & Logistics","text":"The supplier database, catalogue of preferential conditions, route planning, warehouse capacity planning, countless spreadsheets – data for procurement, materials management and logistics are located across a large number of different systems and data sources. There is often a lack of resources and possibilities to make use of them to develop the proper basis for decision-making. Be careful: these are opportunities going to waste!","url":"https://www.cubeware.co/procurement-logistics"},
  {"title":"Executive Board & Management","text":"The purchasing database, production list, analyses from sales and marketing, the CRM system, countless spreadsheets. Where managers and executives need meaningful performance data there is mostly only a jumble of data from different systems and data sources . Instead of being able to take well-informed decisions, managers are pressed for time and have to translate confusing tables into insight and decisions.","url":"https://www.cubeware.co/executive-board-and-management"},
  {"title":"Strategic & Operational Business Planning","text":"Establish user-friendly planning processes in your company – with comprehensive planning functionality, seamlessly integrated business intelligence and performance management processes, the most powerful MOLAP database in the world as planning engine, and a high level of methods-based planning competence. The Cubeware Solutions Platform will support you on your path to operational and strategic excellence.","url":"https://www.cubeware.co/business-planning"},
  {"title":"Standard & Enterprise Reporting","text":"Keep your stakeholders always up to date. Establish automated reporting in your company. Ensure that everyone has the right information at hand when they need it – with comprehensive standard and enterprise reporting functions. The Cubeware Solutions Platform will support you on your path to operational and strategic excellence.","url":"https://www.cubeware.co/standard-and-enterprise-reporting"},
  {"title":"Data Modelling & Data Management","text":"Turn your data into the backbone for your business decisions. However, if you wish to be able to analyse, report and plan, you must prepare, enrich and standardise your interrelate your data. The Cubeware Solutions Platform gives you optimum support in managing and modelling your data!","url":"https://www.cubeware.co/data-modelling-data-management"},
  {"title":"Data Analysis & Data Visualisation","text":"Understand your business better. Establish relationships between business processes. Recognise interrelations in your area of responsibility. Identify patterns in your processes. Using your data, gain insights that were previously hidden. The Cubeware Solutions Platform supports you in analysing and visualising your data so that you can draw the right conclusions and make better decisions even faster.","url":"https://www.cubeware.co/data-analysis-data-visualisation"},
  {"title":"Advanced Analytic With The Cubeware Solutions Platform","text":"The future is here! Give your decision aids and recommendations for action significantly more relevance by automatically enriching them with prediction data based on intelligent algorithms. Cubeware Advance adds advanced analytics functionality to the Cubeware Solutions Platform and assists you in bringing predictive decision support directly to where it is most effective - straight to all decision makers.","url":"https://www.cubeware.co/cubeware-advance"}
]};
</script>

<script>
/*
Tipue Search 7.1
Copyright (c) 2019 Tipue
Tipue Search is released under the MIT License
http://www.tipue.com/search
*/
/*
Stop words
Stop words list from http://www.ranks.nl/stopwords
*/
var tipuesearch_stop_words = ["a", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];
// Word replace
var tipuesearch_replace = {'words': [
    {'word': 'cube', 'replace_with': 'cubeware'},
  	{'word': 'ware', 'replace_with': 'cubeware'},
  	{'word': 'about', 'replace_with': 'why cubeware'},
    {'word': 'javscript', 'replace_with': 'javascript'},
    {'word': 'jqeury', 'replace_with': 'jquery'}
]};
// Weighting
var tipuesearch_weight = {'weight': [
     {'url': 'http://www.tipue.com', 'score': 60},
     {'url': 'http://www.tipue.com/search', 'score': 60},
     {'url': 'http://www.tipue.com/tipr', 'score': 30},
     {'url': 'http://www.tipue.com/support', 'score': 20}
]};
// Illogical stemming
var tipuesearch_stem = {'words': [
     {'word': 'e-mail', 'stem': 'email'}
]};
// Related
var tipuesearch_related = {'Related': [
     {'search': 'cubeware', 'related': 'Search', 'include': 1},
     {'search': 'cubeware', 'related': 'Blog'},
     {'search': 'cubeware', 'related': 'Support'},
  	{'search': 'contact', 'related': 'Contact Us'},
  	{'search': 'contact', 'related': 'Why Cubeware'},
     {'search': 'cubeware search', 'related': 'Demo', 'include': 1},
     {'search': 'cubeware search', 'related': 'Support'}
]};
// Internal strings
var tipuesearch_string_1 = 'No title';
var tipuesearch_string_2 = 'Showing results for';
var tipuesearch_string_3 = 'Search instead for';
var tipuesearch_string_4 = '1 result';
var tipuesearch_string_5 = 'results';
var tipuesearch_string_6 = '<';
var tipuesearch_string_7 = '>';
var tipuesearch_string_8 = 'Nothing found.';
var tipuesearch_string_9 = 'Common words are largely ignored.';
var tipuesearch_string_10 = 'Related';
var tipuesearch_string_11 = 'Search should be one character or more.';
var tipuesearch_string_12 = 'Search should be';
var tipuesearch_string_13 = 'characters or more.';
var tipuesearch_string_14 = 'seconds';
var tipuesearch_string_15 = 'Open Image';
var tipuesearch_string_16 = 'Goto Page';
// Internals
// Timer for showTime
var startTimer = new Date().getTime();
</script>