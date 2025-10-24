import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlVietnamese extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Sản phẩm mỗi trang'; // Đổi 'Items per page' thành tiếng Việt
  override nextPageLabel = 'Trang tiếp theo'; // Đổi 'Next page' thành tiếng Việt
  override previousPageLabel = 'Trang trước'; // Đổi 'Previous page' thành tiếng Việt
  override firstPageLabel = 'Trang đầu tiên'; // Đổi 'First page' thành tiếng Việt
  override lastPageLabel = 'Trang cuối cùng'; // Đổi 'Last page' thành tiếng Việt

  // Cập nhật thông tin hiển thị phân trang
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 của ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} của ${length}`;
  };
}
