from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List, Union
import csv
import io

router = APIRouter()


def _parse_csv_bytes(content: bytes, use_headers: bool = True) -> Union[List[dict], List[list]]:
	text = content.decode("utf-8", errors="replace")
	stream = io.StringIO(text)
	# If headers requested, return list of dicts using first row as keys
	if use_headers:
		try:
			reader = csv.DictReader(stream)
			return [dict(row) for row in reader]
		except Exception:
			raise
	# Otherwise return list of rows (lists)
	reader = csv.reader(stream)
	return [row for row in reader]


@router.post("/csv-to-array", summary="Convert CSV to array", description="Upload a CSV file and get back an array (list of dicts if headers=true, otherwise list of lists)")
async def csv_to_array(file: UploadFile = File(...), use_headers: bool = True):
	if file.content_type not in ("text/csv", "application/vnd.ms-excel", "application/octet-stream"):
		# allow octet-stream because some clients send that for file uploads
		# but still try to parse
		pass
	try:
		content = await file.read()
	except Exception as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed reading uploaded file: {e}")

	try:
		data = _parse_csv_bytes(content, use_headers=use_headers)
	except Exception as e:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed parsing CSV: {e}")

	return {"data": data}

