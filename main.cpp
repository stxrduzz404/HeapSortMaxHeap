#include <cstddef>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

class MaxHeap {
public:
    MaxHeap() = default;

    explicit MaxHeap(const std::vector<int>& values) : heap_(values) {
        buildHeap();
    }

    void push(int value) {
        heap_.push_back(value);
        siftUp(heap_.size() - 1);
    }

    int pop() {
        if (heap_.empty()) {
            throw std::out_of_range("Cannot pop from an empty heap.");
        }

        const int maximum = heap_.front();
        heap_.front() = heap_.back();
        heap_.pop_back();

        if (!heap_.empty()) {
            siftDown(0, heap_.size());
        }

        return maximum;
    }

    int top() const {
        if (heap_.empty()) {
            throw std::out_of_range("Cannot read an empty heap.");
        }
        return heap_.front();
    }

    bool empty() const {
        return heap_.empty();
    }

    std::size_t size() const {
        return heap_.size();
    }

    const std::vector<int>& data() const {
        return heap_;
    }

    void buildHeap() {
        // Leaves already satisfy the heap property. Start at the last parent.
        for (std::size_t i = heap_.size() / 2; i > 0; --i) {
            siftDown(i - 1, heap_.size());
        }
    }

    bool isHeap() const {
        for (std::size_t parent = 0; parent < heap_.size() / 2; ++parent) {
            const std::size_t left = 2 * parent + 1;
            const std::size_t right = 2 * parent + 2;

            if (left < heap_.size() && heap_[parent] < heap_[left]) {
                return false;
            }
            if (right < heap_.size() && heap_[parent] < heap_[right]) {
                return false;
            }
        }
        return true;
    }

private:
    std::vector<int> heap_;

    void siftUp(std::size_t child) {
        while (child > 0) {
            const std::size_t parent = (child - 1) / 2;
            if (heap_[parent] >= heap_[child]) {
                break;
            }
            std::swap(heap_[parent], heap_[child]);
            child = parent;
        }
    }

    void siftDown(std::size_t parent, std::size_t heapSize) {
        while (true) {
            const std::size_t left = 2 * parent + 1;
            const std::size_t right = 2 * parent + 2;
            std::size_t largest = parent;

            if (left < heapSize && heap_[left] > heap_[largest]) {
                largest = left;
            }
            if (right < heapSize && heap_[right] > heap_[largest]) {
                largest = right;
            }

            if (largest == parent) {
                break;
            }

            // We must swap with the larger child. Swapping with the smaller
            // child could leave the larger child greater than its parent.
            std::swap(heap_[parent], heap_[largest]);
            parent = largest;
        }
    }
};

void siftDownRange(std::vector<int>& values, std::size_t parent,
                   std::size_t heapSize) {
    while (true) {
        const std::size_t left = 2 * parent + 1;
        const std::size_t right = 2 * parent + 2;
        std::size_t largest = parent;

        if (left < heapSize && values[left] > values[largest]) {
            largest = left;
        }
        if (right < heapSize && values[right] > values[largest]) {
            largest = right;
        }
        if (largest == parent) {
            return;
        }

        std::swap(values[parent], values[largest]);
        parent = largest;
    }
}

void heapSort(std::vector<int>& values) {
    // Phase 1: bottom-up build of a max heap, O(n).
    for (std::size_t i = values.size() / 2; i > 0; --i) {
        siftDownRange(values, i - 1, values.size());
    }

    // Phase 2: put the current maximum at the end and repair the heap.
    // The sorted suffix grows from right to left.
    for (std::size_t heapSize = values.size(); heapSize > 1; --heapSize) {
        std::swap(values[0], values[heapSize - 1]);
        siftDownRange(values, 0, heapSize - 1);
    }
}

void printVector(const std::vector<int>& values) {
    std::cout << '[';
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (i > 0) {
            std::cout << ", ";
        }
        std::cout << values[i];
    }
    std::cout << ']';
}

std::vector<int> readNumbers() {
    std::cout << "Enter integers separated by spaces\n"
                 "(press Enter to use 21 64 8 52 37 90 17): ";

    std::string line;
    std::getline(std::cin, line);
    if (line.empty()) {
        return {21, 64, 8, 52, 37, 90, 17};
    }

    std::istringstream input(line);
    std::vector<int> values;
    int value = 0;
    while (input >> value) {
        values.push_back(value);
    }

    if (!input.eof()) {
        throw std::invalid_argument("Input contains a non-integer value.");
    }
    if (values.empty()) {
        throw std::invalid_argument("Please enter at least one integer.");
    }
    return values;
}

int main() {
    try {
        const std::vector<int> input = readNumbers();

        std::cout << "\nOriginal data:       ";
        printVector(input);
        std::cout << '\n';

        MaxHeap heap(input);
        std::cout << "Max heap:            ";
        printVector(heap.data());
        std::cout << "\nisHeap result:       "
                  << (heap.isHeap() ? "true" : "false") << '\n';
        std::cout << "Maximum (heap top):  " << heap.top() << '\n';

        std::cout << "Pop order (DESC):    [";
        bool first = true;
        while (!heap.empty()) {
            if (!first) {
                std::cout << ", ";
            }
            std::cout << heap.pop();
            first = false;
        }
        std::cout << "]\n";

        std::vector<int> sorted = input;
        heapSort(sorted);
        std::cout << "Heap sort (ASC):     ";
        printVector(sorted);
        std::cout << "\n\nTime complexity:\n"
                     "  buildHeap : O(n)\n"
                     "  push      : O(log n)\n"
                     "  top       : O(1)\n"
                     "  pop       : O(log n)\n"
                     "  heapSort  : O(n log n)\n"
                     "Auxiliary space of in-place heapSort: O(1)\n";
    } catch (const std::exception& error) {
        std::cerr << "Error: " << error.what() << '\n';
        return 1;
    }

    return 0;
}
