import requests
import re
from lxml import etree
import os

headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
    'referer': 'https://www.mzitu.com/'
}
response = requests.get('https://www.mzitu.com/230331', headers=headers)

element = etree.HTML(response.text)
spans = element.xpath('//div[@class="pagenavi"]//span')
titles = element.xpath('//h2[@class="main-title"]/text()')
print(titles[0])
path = "./{}".format(titles[0])
if not os.path.exists(path):
    os.makedirs(path)

numReg = re.compile(r'\d+')
pageNums = [span.text for span in spans if numReg.match(span.text)]
pageNumMax = int(pageNums.pop())

for i in range(1, pageNumMax + 1):
    response = requests.get("https://www.mzitu.com/230331/{}".format(i), headers=headers)
    element = etree.HTML(response.text)
    img = element.xpath('//div[@class="main-image"]//img')
    r = requests.get(img[0].attrib["src"], headers=headers, stream=True)

    with open("{}/{}.jpg".format(path, i), "wb") as f:
        for chunk in r.iter_content(chunk_size=512):
            f.write(chunk)

print(list)
