# Blogger Video Transformer

এই project নিজের/অনুমতিপ্রাপ্ত ভিডিও automatic processing-এর জন্য।

Files:
- server.js — Node.js backend
- package.json — dependencies
- blogger.html — Blogger/front-end UI

Important:
Blogger নিজে Node.js/FFmpeg server চালাতে পারে না। তাই server.js-কে আলাদা Node.js hosting-এ deploy করতে হবে। Blogger page থেকে সেই backend API-তে request পাঠাতে হবে।

বর্তমান version:
- video upload
- automatic 1280x720 normalization
- H.264/AAC encoding
- downloadable output

এটি copyright removal বা platform copyright-detection bypass tool নয়।
