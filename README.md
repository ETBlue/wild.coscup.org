<h4>data-attributes總整理</h4>
<p>data-use-schedule: 內容需輸入schedule type，表示此標籤屬於某類排程資訊。</p>
<p>data-countdown-html: 無需輸入內容。程式會在此標籤內顯示倒數計時。</p>
<p>data-schedule-id: 內容需輸入schedule id，表示此標籤屬於指定排程。</p>
<p>data-schedule-content: 內容需輸入google spread sheets的欄位名稱。程式會自動在網頁載入時將相應內容填入。</p>
<p>data-change-schedule: 內容需輸入schedule type，當使用者點擊data-change-schedule時，data-use-schedule屬性內容為指定schedule type的標籤顯示，其他有data-use-schedule屬性的標籤會隱藏。</p>
<p>data-toggle-like: 當使用者點擊時，自動在body上切換showLikeScheduleDifference class。</p>
<p>data-like-schedule: 內容需輸入schedule id，當使用者點擊時，會以瀏覽器記憶喜歡的schedule id。所有data-schedule-id屬性為喜歡schedule id的標籤會加上beLike class。</p>
<p>data-active-on: 內容需輸入micro time stamp，瀏覽者的系統時間超過內容時間時，該標籤會自動加上active class。</p>
<p>data-expire-on: 內容需輸入micro time stamp，瀏覽者的系統時間超過內容時間時，該標籤會自動加上expire class，同時移除active class。</p>