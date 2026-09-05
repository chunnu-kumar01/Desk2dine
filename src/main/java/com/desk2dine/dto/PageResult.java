package com.desk2dine.dto;

import java.util.List;

/**
 * Generic pagination envelope returned by every list endpoint that
 * supports paging (menu items, orders, audit logs, ...). Keeping this
 * generic means every repository's paginated query returns the same
 * shape instead of each module inventing its own.
 */
public class PageResult<T> {
    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    public PageResult(List<T> content, int page, int size, long totalElements) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
    }

    public List<T> getContent() { return content; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
}
