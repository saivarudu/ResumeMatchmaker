import io
import os
import json
import sys 
import string
import xlrd
import array as arr
from pdfminer.converter import TextConverter
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfpage import PDFPage

# IN ORDER TO GET THE COLUMN WHICH CONTAINS required
# KEYWORD AND ITS SCORE FROM KEYWORD.XLSX FILE.


def extract_req_column(keyword_xl_path, keyword):
    workbook = xlrd.open_workbook(keyword_xl_path)
    sheet = workbook.sheet_by_index(0)
    row1 = sheet.row_values(0)
    #print(row1)
    if(keyword in row1):
        req_col1 = row1.index(keyword)
        return req_col1

# TO CALCULATE THE SCORE OF A PRTICULAR RESUME
# keyword_xl_path is path excel file containing keyword and respective score
# resume is the path of resume on which calculation to be done


def resume_score_calculation(keyword_xl_path, keyword, resume):
    workbook = xlrd.open_workbook(keyword_xl_path)
    sheet = workbook.sheet_by_index(0)
    req_col1 = extract_req_column(keyword_xl_path, keyword)
    #print(req_col1)
    my_list = []
    col_a = sheet.col_values(req_col1, 1)
    for entries in col_a:
            entries = entries.lower()
            my_list.append(entries)
    col_a = my_list
    col_b = sheet.col_values(req_col1+1, 1)
    my_dict = {a: b for a, b in zip(col_a, col_b)}
    #print(my_dict)
    resume_text = extract_text_from_pdf(resume)
    resume_text = resume_text.lower()
    #print(resume_text)
    resume_score = 0
    for word in resume_text.split():
        #print(word)
        if word in my_dict:
            resume_score += my_dict[word]
    #print(resume_score)

    return resume_score


def extract_text_from_pdf(pdf_path):
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle)
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    with open(pdf_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh,
                                      caching=True,
                                      check_extractable=True):
            page_interpreter.process_page(page)
        text = fake_file_handle.getvalue()
    # close open handles
    converter.close()
    fake_file_handle.close()
    if text:
        return text


def extract_text_by_page(pdf_path):
    with open(pdf_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh,
                                      caching=True,
                                      check_extractable=True):
            resource_manager = PDFResourceManager()
            fake_file_handle = io.StringIO()
            converter = TextConverter(resource_manager, fake_file_handle)
            page_interpreter = PDFPageInterpreter(resource_manager, converter)
            page_interpreter.process_page(page)
            text = fake_file_handle.getvalue()
            yield text
            # close open handles
            converter.close()
            fake_file_handle.close()


def export_as_json(pdf_path, json_path):
    filename = os.path.splitext(os.path.basename(pdf_path))[0]
    data = {'Filename': filename}
    data['Pages'] = []
    counter = 1
    for page in extract_text_by_page(pdf_path):
        text = page[:]
        text = text.replace("\u00a0", "")
        page = {'Page_{}'.format(counter): text}
        data['Pages'].append(page)
        counter += 1
    with open(json_path, 'w') as fh:
        json.dump(data, fh)


if __name__ == '__main__':
        keyword = 'Java'
        keyword1 = 'Angular'
        keyword2 = 'Python'
        #print("the argument found is {}".format(keyword))
        #keyword = 'Angular'
        keyword_xl_path = r'C:\Users\Hack5GURTeam32\Desktop\ResumeMatchmaker\ai_ml\hackathon\hackathonScript\keywords.xlsx'
        #pdf_path = r'C:\Users\Hack5GURTeam32\Desktop\ResumeMatchmaker\src\assets\files\resume2.pdf'
        path = 'C:\\Users\\Hack5GURTeam32\\Desktop\\ResumeMatchmaker\\src\\assets\\files\\'
        files = []
        largestKeyword = '';
        pdf_path = '';
        largestpath = '';
        # r=root, d=directories, f = files
        for r, d, f in os.walk(path):
            for file in f:
                if '.pdf' in file:
                    files.append(os.path.join(r, file))

        for f in files:
            pdf_path = f
            score = resume_score_calculation(keyword_xl_path, keyword, pdf_path)
            score1 = resume_score_calculation(keyword_xl_path, keyword1, pdf_path)
            score2 = resume_score_calculation(keyword_xl_path, keyword2, pdf_path)
            if (score > score1) and (score > score2):
                largestKeyword = keyword
                largestpath = pdf_path
            elif (score1 > score) and (score1 > score2):
                largestKeyword = keyword1
                largestpath = pdf_path
            else:
                largestKeyword = keyword2
                largestpath = pdf_path
            print(largestpath)
            print(largestKeyword)
        sys.stdout.flush()
